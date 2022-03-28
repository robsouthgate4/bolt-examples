
import { quat, vec3 } from "gl-matrix";
import Bolt, { VBO, VAO, Transform, ArrayBuffer, Node } from "@robsouthgate/bolt-core";

import { GlTf, Mesh, MeshPrimitive } from "./types/GLTF";
import { GeometryBuffers } from "@robsouthgate/bolt-core/lib/ArrayBuffer";

interface AccessorDict {
    [id: string]: number;
}

interface AttributeInfo {
    vbo: VBO;
    type: number;
    numComponents: number;
    stride: number;
    offset: number;
}
interface AttribName {
    [id: string]: AttributeInfo;
}

export default class GLTFLoader {

    bolt: Bolt;
    gl: WebGL2RenderingContext;

    private _accessorTypeToNumComponentsMap: AccessorDict = {
    	'SCALAR': 1,
    	'VEC2': 2,
    	'VEC3': 3,
    	'VEC4': 4,
    	'MAT2': 4,
    	'MAT3': 9,
    	'MAT4': 16,
    };

    constructor( bolt: Bolt ) {

    	this.bolt = bolt;
    	this.gl = bolt.getContext();

    }

    async loadGLTF( basePath: string, url: string ) {

    	const response = await fetch( `${basePath}/${url}` );
    	if ( ! response.ok ) {

    		throw new Error( `could not load: ${url}` );

    	}

    	const gltf = await response.json() as GlTf;
    	let bin: ArrayBufferLike;

    	if ( gltf.buffers ) {

    		bin = await this._loadBinaryBuffer( `${basePath}/${gltf.buffers[ 0 ].uri}` ) as ArrayBufferLike;

    	}

    	if ( gltf.meshes ) {

    		gltf.meshes.forEach( ( mesh: Mesh ) => {

    			mesh.primitives.forEach( ( primitive: MeshPrimitive ) => {

    				const attributes: AttribName = {};

    				let numElements = 0;

    				for ( const [ attribName, index ] of Object.entries( primitive.attributes ) ) {

    					const { accessor, stride, vbo, buffer } = this._getAccessorAndBuffer( this.gl, gltf, index, bin );

    					const capitalise = ( string: string ) =>
    						string.replaceAll( /\S*/g, word =>
    							`${word.slice( 0, 1 )}${word.slice( 1 ).toLowerCase()}`
    						);

    					attributes[ `a${capitalise( attribName )}` ] = {
    						vbo,
    						buffer,
    						type: accessor.componentType,
    						numComponents: this._accessorTypeToNumComponents( accessor.type ),
    						stride,
    						offset: accessor.byteOffset | 0
    					} as AttributeInfo;

    				}

    				const bufferInfo = {
    					attributes,
    					numElements,
    					indices: new Uint16Array(),
    					elementType: 0
    				};

    				if ( primitive.indices !== undefined ) {

    					const { accessor, buffer } = this._getAccessorAndIndices( this.gl, gltf, primitive.indices, bin );
    					bufferInfo.numElements = accessor.count;
    					bufferInfo.indices = buffer;
    					bufferInfo.elementType = accessor.componentType;

    				}

    				primitive.bufferInfo = bufferInfo;

    				const vao = new VAO();

    				let index = 0;

    				for ( const [ key, value ] of Object.entries( attributes ) ) {

    					index ++;

    					vao.linkAttrib( value.vbo, index, value.numComponents, this.gl.FLOAT, value.stride, value.offset );

    				}

    				primitive.vao = vao;

    				if ( primitive.material ) {

    					primitive.materialBolt = gltf.materials && gltf.materials[ primitive.material ] || undefined;

    				}

    			} );

    		} );

    	}

    	const originalNodes = gltf.nodes;

    	const nodes = gltf.nodes?.map( ( node ) => {

    		const { name, translation, rotation, scale, mesh } = node;
    		const rootTransform = new Transform();
    		rootTransform.position = translation ? vec3.fromValues( translation[ 0 ], translation[ 1 ], translation[ 2 ] ) : vec3.fromValues( 0, 0, 0 );
    		rootTransform.quaternion = rotation ? quat.fromValues( rotation[ 0 ], rotation[ 1 ], rotation[ 2 ], rotation[ 3 ] ) : quat.fromValues( 0, 0, 0, 1 );
    		rootTransform.scale = scale ? vec3.fromValues( scale[ 0 ], scale[ 1 ], scale[ 2 ] ) : vec3.fromValues( 1, 1, 1 );

    		const rootNode = new Node();
    		rootNode.transform = rootTransform;
    		rootNode.name = name;

    		if ( gltf.meshes && gltf.meshes.length > 0 ) {

    			if ( mesh != undefined ) {

    				const gltfMesh = gltf.meshes[ mesh ];

    				if ( gltfMesh ) {

    					gltfMesh.primitives.forEach( ( primitive ) => {

    						const attribs = primitive.bufferInfo.attributes;

    						const geometry: GeometryBuffers = {
    							positions: attribs.aPosition ? attribs.aPosition.buffer : new Float32Array(),
    							normals: attribs.aNormal ? attribs.aNormal.buffer : new Float32Array(),
    							uvs: attribs.aTexcoord_0 ? attribs.aTexcoord_0.buffer : new Float32Array(),
    							indices: primitive.bufferInfo.indices
    						};

    						const arrayBuffer = new ArrayBuffer( geometry );
    						rootNode.drawables.push( arrayBuffer );

    					} );

    				}

    			}

    		}

    		return rootNode;

    	} );

    	if ( originalNodes ) {

    		gltf.nodes?.forEach( ( node, index ) => {

    			const children = originalNodes[ index ].children;

    			if ( children ) {

    				children.forEach( ( childNdx ) => {

    					if ( ! gltf.nodes ) return;

    					const child = gltf.nodes[ childNdx ];
    					child.setParent( node );

    				} );

    			}


    		} );

    	}


    	if ( gltf.scenes ) {

    		for ( const scene of gltf.scenes ) {

    			scene.root = new Node();
    			scene.root.name = scene.name;

    			if ( scene.nodes ) {

    				scene.nodes.forEach( ( childNdx ) => {

    					if ( ! nodes ) return;

    					const child = nodes[ childNdx ];
    					child.setParent( scene.root );

    				} );

    			}



    		}

    	}

    	return gltf;



    }

    private _getAccessorAndBuffer( gl: WebGL2RenderingContext, gltf: any, accessorIndex: number, bin: ArrayBufferLike ) {

    	const accessor = gltf.accessors[ accessorIndex ];
    	const bufferView = gltf.bufferViews[ accessor.bufferView ];

    	const buffer = new Float32Array(
    		bin,
    		bufferView.byteOffset,
    		bufferView.byteLength / Float32Array.BYTES_PER_ELEMENT );


    	bufferView.vbo = new VBO( buffer );

    	return {
    		accessor,
    		vbo: bufferView.vbo,
    		buffer,
    		stride: bufferView.stride || 0,
    	};

    }

    private _getAccessorAndIndices( gl: WebGL2RenderingContext, gltf: any, accessorIndex: number, bin: ArrayBufferLike ) {

    	const accessor = gltf.accessors[ accessorIndex ];
    	const bufferView = gltf.bufferViews[ accessor.bufferView ];

    	const buffer = new Uint16Array( bin, bufferView.byteOffset, bufferView.byteLength / Uint16Array.BYTES_PER_ELEMENT );

    	return {
    		accessor,
    		buffer,
    		stride: bufferView.stride || 0,
    	};

    }

    _accessorTypeToNumComponents( type: string ) {

    	const map = this._accessorTypeToNumComponentsMap[ type ];

    	if ( ! map ) {

    		throw new Error( `no key: ${type}` );

    	} else {

    		return map;

    	}

    }


    _loadBinaryBuffer( url: string ) {

    	return new Promise( ( resolve, reject ) => {

    		const request = new XMLHttpRequest();
    		request.open( "GET", url, true );
    		request.responseType = "arraybuffer";
    		request.onload = () => {

    			resolve( request.response );

    		};

    		request.onerror = ( err ) => {

    			reject( err );

    		};

    		request.send();

    	} );

    }

}
