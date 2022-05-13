import Bolt, { Batch, IBO, Mesh, Node, Shader, Transform, VBO } from "@bolt-webgl/core";
import { GeometryBuffers } from "@bolt-webgl/core/build/Mesh";
import { mat4, quat, vec3 } from "gl-matrix";
import { Accessor, GlTf, Mesh as GLTFMesh, MeshPrimitive, Node as GLTFNode } from "./types/GLTF";
import { TypedArray } from "./types/TypedArray";

import vertexShader from "./shaders/color/color.vert";
import fragmentShader from "./shaders/color/color.frag";

enum BufferType {
    Float = 5126,
    Short = 5123,
}

interface Buffer {
    data: Float32Array | Int16Array;
    size: number;
    type: string;
    componentType: BufferType;
    glBuffer: WebGLBuffer;
}

export default class GLTFLoader2 {

    private _bolt: Bolt;

    private _accessorSize: { [key: string]: number } = {
    	'SCALAR': 1,
    	'VEC2': 2,
    	'VEC3': 3,
    	'VEC4': 4,
    	'MAT2': 4,
    	'MAT3': 9,
    	'MAT4': 16,
    };

    private _typedArrayMap: { [key: string]: TypedArray } = {
    	'5120': Int8Array,
    	'5121': Uint8Array,
    	'5122': Int16Array,
    	'5123': Uint16Array,
    	'5124': Int32Array,
    	'5125': Uint32Array,
    	'5126': Float32Array,
    }

    private _scene!: Node[];


    constructor( bolt: Bolt ) {

    	this._bolt = bolt;

    }

    async _fetchBuffer( path: string, buffer: string ) {

    	const dir = path.split( '/' ).slice( 0, - 1 ).join( '/' );
    	const response = await fetch( `${dir}/${buffer}` );
    	return await response.arrayBuffer();

    }

    _getBufferFromFile( gltf: GlTf, buffers: ArrayBuffer[], accessor: Accessor ) {

    	const bufferView = gltf.bufferViews![ <number>accessor.bufferView ];

    	const type = accessor.type;

    	// size of the data set
    	const size = this._accessorSize[ type ];

    	// component type as number
    	const componentType = accessor.componentType;

    	// get the array buffer type from map and fetch relevant data
    	const data = new this._typedArrayMap[ componentType ]( buffers[ bufferView.buffer ], ( accessor.byteOffset || 0 ) + ( bufferView.byteOffset || 0 ), accessor.count * size ) as ArrayBuffer;

    	return {
    		size,
    		data,
    		componentType,
    		type
    	} as Buffer;

    }

    _getAccessor = ( gltf: GlTf, mesh: GLTFMesh, primitive: MeshPrimitive, attributeName: string ) => {

    	const attribute = primitive.attributes[ attributeName ];
    	return gltf.accessors![ attribute ];

    };

    _getBufferByAttribute( gltf: GlTf, buffers: ArrayBuffer[], mesh: GLTFMesh, primitive: MeshPrimitive, attributeName: string ) {

    	if ( primitive.attributes[ attributeName ] === undefined ) return;
    	const accessor = this._getAccessor( gltf, mesh, primitive, attributeName );
    	const bufferData = this._getBufferFromFile( gltf, buffers, accessor );
    	return bufferData;


    }

    async load( path: string, fileName: string ) {

    	const uri = path + fileName;

    	const response = await fetch( path + fileName );
    	const gltf = await response.json() as GlTf;

    	if ( gltf.accessors === undefined || gltf.accessors.length === 0 ) {

    		throw new Error( 'GLTF File is missing accessors' );

    	}

    	// get the default scene
    	const scene = gltf.scenes![ gltf.scene || 0 ];

    	// get the root node of the scene
    	const rootNode: number = scene.nodes![ 0 ];

    	// grab buffers from .bin
    	const buffers = await Promise.all(
    		gltf.buffers!.map( async( buffer ) => await this._fetchBuffer( uri, buffer.uri! ) )
    	);

    	// arrange nodes with correct transforms
    	const nodes = gltf.nodes!.map( ( node, index ) => this._arrangeNode( index, node ) );

    	// construct batches
    	const batches = gltf.meshes!.map( ( mesh ) => this._loadBatch( gltf, mesh, buffers ) );

    	const root = new Node();
    	root.name = "root";

    	// arrange scene graph
    	nodes!.forEach( ( node: GLTFNode, i: number ) => {

    		const children = node.children;

    		// parent batches to node
    		if ( node.mesh != undefined ) {

    			const b = batches[ node.mesh ];

    			b.forEach( ( batch?: Batch ) => {

    		    	batch?.setParent( nodes[ i ].node );

    			} );

    		}

    		// set parent  nodes
    		if ( children ) {

    			children.forEach( ( childIndex: number ) => {

    				const n = nodes[ childIndex ];

    				n.node.setParent( nodes[ i ].node );

    			} );

    		}


    	} );

    	// attach nodes to root node
    	nodes.forEach( ( node: any ) => {

    		node.node.setParent( root );

    	} );

    	return root;


    }

    _arrangeNode( index: number, node: GLTFNode ) {

    	const { name, translation, rotation, scale, mesh, children, skin } = node;
    	const trs = new Transform();
    	trs.position = translation ? vec3.fromValues( translation[ 0 ], translation[ 1 ], translation[ 2 ] ) : vec3.fromValues( 0, 0, 0 );
    	trs.quaternion = rotation ? quat.fromValues( rotation[ 0 ], rotation[ 1 ], rotation[ 2 ], rotation[ 3 ] ) : quat.fromValues( 0, 0, 0, 1 );
    	trs.scale = scale ? vec3.fromValues( scale[ 0 ], scale[ 1 ], scale[ 2 ] ) : vec3.fromValues( 1, 1, 1 );

    	const n = new Node();
    	n.name = name;
    	n!.transform = trs;

    	return {
    		id: index,
    		node: n,
    		mesh,
    		skin,
    		localBindTransform: trs,
    		animatedTransform: mat4.create(),
    		children: children || []
    	};

    }

    _loadBatch( gltf: GlTf, mesh: GLTFMesh, buffers: ArrayBufferLike[] ) {

    	return mesh.primitives.map( ( primitive ) => {

    		if ( primitive.indices !== undefined ) {

    			// get index accessor
    			const indexAccesor = gltf.accessors![ primitive.indices! ];

    			// form bolt default geo buffers
    			const geometry: GeometryBuffers = {
    				positions: this._getBufferByAttribute( gltf, buffers, mesh, primitive, "POSITION" )!.data as Float32Array,
    				normals: this._getBufferByAttribute( gltf, buffers, mesh, primitive, "NORMAL" )!.data as Float32Array,
    				uvs: this._getBufferByAttribute( gltf, buffers, mesh, primitive, "TEXCOORD_0" )!.data as Float32Array,
    				indices: this._getBufferFromFile( gltf, buffers, indexAccesor )!.data as Int16Array
    			};

    			// construct batches
    			const m = new Mesh( geometry );
    			const batch = new Batch( m, new Shader( vertexShader, fragmentShader ) );

    			return batch;

    		}

    	} );



    }

    public get scene(): Node[] {

    	return this._scene;

    }
    public set scene( value: Node[] ) {

    	this._scene = value;

    }

}
