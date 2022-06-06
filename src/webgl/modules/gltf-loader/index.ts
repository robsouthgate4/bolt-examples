import Bolt, { Batch, CLAMP_TO_EDGE, LINEAR, Mesh, Node, Shader, Texture, Transform } from "@bolt-webgl/core";
import { GeometryBuffers } from "@bolt-webgl/core/build/Mesh";
import { mat4, quat, vec3 } from "gl-matrix";
import { Accessor, GlTf, Material, Mesh as GLTFMesh, MeshPrimitive, Node as GLTFNode, Texture as GLTFTexture, Skin as GLTFSkin } from "./types/GLTF";
import { TypedArray } from "./types/TypedArray";

import vertexShader from "./shaders/color/color.vert";
import fragmentShader from "./shaders/color/color.frag";

import skinVertexShader from "./shaders/skin/skin.vert";
import skinFragmentShader from "./shaders/skin/skin.frag";

import Skin from "./Skin";
import SkinMesh from "./SkinMesh";

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

export default class GLTFLoader {

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

    private _path!: string;
    private _materials!: Shader[];
    private _textures!: Texture[];
    private _root!: Node;
    private _skins!: Skin[];
    private _nodes!: { id: number; node: Node; mesh: number | undefined; skin: number | undefined; localBindTransform: Transform; animatedTransform: mat4; children: number[]; }[];
    private _batches!: ( Batch | undefined )[][]

    constructor( bolt: Bolt ) {

    	this._bolt = bolt;

    }

    async load( path: string, fileName: string ) {

    	const uri = path + fileName;

    	this._path = path;

    	const response = await fetch( path + fileName );
    	const gltf = await response.json() as GlTf;

    	if ( gltf.accessors === undefined || gltf.accessors.length === 0 ) {

    		throw new Error( 'GLTF File is missing accessors' );

    	}

    	// grab buffers from .bin
    	const buffers = await Promise.all(
    		gltf.buffers!.map( async( buffer ) => await this._fetchBuffer( uri, buffer.uri! ) )
    	);

    	// arrange nodes with correct transforms
    	this._nodes = gltf.nodes!.map( ( node, index ) => this._parseNode( index, node ) );

    	// map textures
    	if ( gltf.textures ) {

    		this._textures = await Promise.all(
                gltf.textures!.map( async( texture ) => await this._parseTexture( gltf, texture ) )
    		);

    	}

    	// map materials
    	if ( gltf.materials ) {

    		this._materials = gltf.materials!.map( ( material: Material ) => this._parseMaterials( gltf, material ) );

    	}

    	// map skins

    	if ( gltf.skins ) {

    		this._skins = gltf.skins!.map( ( skin: GLTFSkin ) => this._parseSkin( gltf, skin, buffers ) );

    	}

    	// map batches
    	this._batches = gltf.meshes!.map( ( mesh ) => this._parseBatch( gltf, mesh, buffers ) );


    	// arrange scene graph
    	this._nodes!.forEach( ( node: GLTFNode, i: number ) => {

    		const children = node.children;

    		// parent batches to node
    		if ( node.mesh != undefined ) {

    			const b = this._batches[ node.mesh ];

    			b.forEach( ( batch?: Batch ) => {

    		    	batch?.setParent( this._nodes[ i ].node );

    			} );

    		}

    		// set parent nodes
    		if ( children ) {

    			children.forEach( ( childIndex: number ) => {

    				const n = this._nodes[ childIndex ];

    				n.node.setParent( this._nodes[ i ].node );

    			} );

    		}


    	} );


    	this._root = new Node();

        gltf.scenes!.forEach( ( scene ) => {

        	this._root.name = scene.name;

        	scene.nodes?.forEach( childNode => {

        		const child = this._nodes[ childNode ];

        		child.node.setParent( this._root );

        	} );

        } );

    	return this._root;


    }

    _parseSkin( gltf: GlTf, skin: GLTFSkin, buffers: ArrayBufferLike[] ): Skin {

    	const bindTransforms = this._getBufferFromFile( gltf, buffers, gltf.accessors![ skin.inverseBindMatrices! ] );
    	const joints = skin.joints.map( ndx => this._nodes[ ndx ].node );

    	return new Skin( joints, bindTransforms.data as Float32Array );

    }

    _parseNode( index: number, node: GLTFNode ) { //TODO: setup skin mesh render

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

    _parseBatch( gltf: GlTf, mesh: GLTFMesh, buffers: ArrayBufferLike[] ) {

    	return mesh.primitives.map( ( primitive ) => {

    		if ( primitive.indices !== undefined ) {

    			// get index accessor
    			const indexAccesor = gltf.accessors![ primitive.indices! ];

    			const uvs = this._getBufferByAttribute( gltf, buffers, mesh, primitive, "TEXCOORD_0" ) || undefined;
    			const uvs2 = this._getBufferByAttribute( gltf, buffers, mesh, primitive, "TEXCOORD_1" ) || undefined;
    			const normals = this._getBufferByAttribute( gltf, buffers, mesh, primitive, "NORMAL" ) || undefined;
    			const indices = this._getBufferFromFile( gltf, buffers, indexAccesor ) || undefined;

    			// form bolt default geo buffers
    			const geometry: GeometryBuffers = {
    				// every geometry should have position data by default
    				positions: this._getBufferByAttribute( gltf, buffers, mesh, primitive, "POSITION" )!.data as Float32Array,
    				normals: normals ? normals!.data as Float32Array : [],
    				uvs: uvs ? uvs!.data as Float32Array : [],
    				uvs2: uvs2 ? uvs2!.data as Float32Array : [],
    				indices: indices ? indices!.data as Int16Array : []
    			};

    			// form skinned mesh data if defined

    			// get joints from buffer
    			const joints = this._getBufferByAttribute( gltf, buffers, mesh, primitive, "JOINTS_0" ) || undefined;

    			// get weights from buffer
    			const weights = this._getBufferByAttribute( gltf, buffers, mesh, primitive, "WEIGHTS_0" ) || undefined;

    			let m: Mesh | SkinMesh;

    			if ( joints != undefined ) {

    				console.log( this._skins );

    				//m = new SkinMesh( geometry, joints!.data as Float32Array, weights!.data as Float32Array );

    			} else {


    			}


    			m = new Mesh( geometry );

    			// construct batches
    			const batch = new Batch( m, this._materials ? this._materials[ primitive.material as number ] : new Shader( vertexShader, fragmentShader ) );

    			return batch;

    		}

    	} );

    }

    _parseMaterials( gltf: GlTf, material: Material ): Shader {

    	//TODO: PBR shader setup

    	const shader = new Shader( vertexShader, fragmentShader );

    	shader.name = material.name;

    	if ( material.pbrMetallicRoughness ) {

    		const { baseColorTexture } = material.pbrMetallicRoughness;

    		if ( baseColorTexture ) {

    			shader.activate();
    			shader.setTexture( "baseTexture", this._textures[ baseColorTexture.index ] );

    		}

    	}

    	return shader;

    }

    async _parseTexture( gltf: GlTf, texture: GLTFTexture ) {

    	const t = gltf.images![ texture.source! ];
    	const s = gltf.samplers![ texture.sampler! ];

    	const boltTexture = new Texture( {
    		imagePath: this._path + t.uri,
    		wrapS: s.wrapS || CLAMP_TO_EDGE,
    		wrapT: s.wrapT || CLAMP_TO_EDGE,
    	} );

    	boltTexture.minFilter = s.minFilter! || LINEAR;
    	boltTexture.magFilter = s.magFilter! || LINEAR;

    	await boltTexture.load();

    	return boltTexture;

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

    _getBufferByAttribute( gltf: GlTf, buffers: ArrayBuffer[], mesh: GLTFMesh, primitive: MeshPrimitive, attributeName: string ) {

    	if ( primitive.attributes[ attributeName ] === undefined ) return;
    	const accessor = this._getAccessor( gltf, mesh, primitive, attributeName );
    	const bufferData = this._getBufferFromFile( gltf, buffers, accessor );
    	return bufferData;

    }

    _getAccessor = ( gltf: GlTf, mesh: GLTFMesh, primitive: MeshPrimitive, attributeName: string ) => {

    	const attribute = primitive.attributes[ attributeName ];
    	return gltf.accessors![ attribute ];

    };

    public get root(): Node {

    	return this._root;

    }
    public set root( value: Node ) {

    	this._root = value;

    }



}
