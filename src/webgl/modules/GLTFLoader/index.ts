
import { quat, vec3, vec4 } from "gl-matrix";
import Bolt, { VBO, VAO, Transform, Mesh, Node, Batch, Shader } from "@bolt-webgl/core";

import { GlTf, Mesh as GLTFMesh, MeshPrimitive } from "./types/GLTF";
import { GeometryBuffers } from "@bolt-webgl/core/lib/Mesh";

import vertexShader from "../../examples/shaders/color/color.vert";
import fragmentShader from "../../examples/shaders/color/color.frag";

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

type TypedArray =
Int8ArrayConstructor
| Uint8ArrayConstructor // gl.UNSIGNED_BYTE
| Int16ArrayConstructor // gl.SHORT
| Uint16ArrayConstructor // gl.UNSIGNED_SHORT
| Int32ArrayConstructor // gl.INT
| Uint32ArrayConstructor // gl.UNSIGNED_INT
| Float32ArrayConstructor

interface TypedArrayDict {
    [key: string]: TypedArray;
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

    private _typedArrayMap: TypedArrayDict = {
    	'5120': Int8Array, // gl.BYTE
    	'5121': Uint8Array, // gl.UNSIGNED_BYTE
    	'5122': Int16Array, // gl.SHORT
    	'5123': Uint16Array, // gl.UNSIGNED_SHORT
    	'5124': Int32Array, // gl.INT
    	'5125': Uint32Array, // gl.UNSIGNED_INT
    	'5126': Float32Array, // gl.FLOAT
    }

    constructor( bolt: Bolt ) {

    	this.bolt = bolt;
    	this.gl = bolt.getContext();

    }

    async loadGLTF( basePath: string, url: string ) {

    	const response = await fetch( `${basePath}${url}` );
    	if ( ! response.ok ) {

    		throw new Error( `could not load: ${url}` );

    	}

    	const gltf = await response.json() as GlTf;
    	let bin: ArrayBufferLike;

    	if ( gltf.buffers ) {

    		bin = await this._loadBinaryBuffer( `${basePath}/${gltf.buffers[ 0 ].uri}` ) as ArrayBufferLike;

    	}

    	if ( gltf.meshes ) {

    		gltf.meshes.forEach( ( mesh: GLTFMesh ) => {

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

    				if ( primitive.indices !== undefined ) {

    					const { accessor, buffer } = this._getAccessorAndIndices( this.gl, gltf, primitive.indices, bin );

    					const bufferInfo = {
    						attributes,
    						numElements,
    						indices: new this._typedArrayMap[ accessor.componentType ](),
    						elementType: 0
    					};

    					bufferInfo.numElements = accessor.count;
    					bufferInfo.indices = buffer;
    					bufferInfo.elementType = accessor.componentType;

    					primitive.bufferInfo = bufferInfo;

    				}


    				const vao = new VAO();

    				let index = 0;

    				for ( const [ key, value ] of Object.entries( attributes ) ) {

    					index ++;

    					vao.linkAttrib( value.vbo, index, value.numComponents, this.gl.FLOAT, value.stride, value.offset );

    				}

    				primitive.vao = vao;

    				if ( primitive.material != undefined ) {

    					primitive.materialBolt = gltf.materials && gltf.materials[ primitive.material ] || undefined;

    				}

    			} );

    		} );

    	}

    	const originalNodes = gltf.nodes;

    	const computedNodes = gltf.nodes?.map( ( node ) => {

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

    					let geometry: GeometryBuffers = {};

    					gltfMesh.primitives.forEach( ( primitive: MeshPrimitive ) => {

    						const attribs = primitive.bufferInfo.attributes;

    						geometry = {
    							positions: attribs.aPosition ? attribs.aPosition.buffer : new Float32Array(),
    							normals: attribs.aNormal ? attribs.aNormal.buffer : new Float32Array(),
    							uvs: attribs.aTexcoord_0 ? attribs.aTexcoord_0.buffer : new Float32Array(),
    							indices: primitive.bufferInfo.indices
    						};

    						const mesh = new Mesh( geometry );
    						const batch = new Batch( mesh, new Shader( vertexShader, fragmentShader ) );

    						if ( primitive.materialBolt ) {

    							if ( primitive.materialBolt.pbrMetallicRoughness ) {


    							const { baseColorFactor } = primitive.materialBolt.pbrMetallicRoughness;

    							const shader = batch.shader;
    							shader.activate();
    							shader.setVector4( "baseColor", baseColorFactor ? vec4.fromValues( baseColorFactor[ 0 ], baseColorFactor[ 1 ], baseColorFactor[ 2 ], baseColorFactor[ 3 ] ) : vec4.fromValues( 1, 1, 1, 1 ) );

    							}


    						}

    						batch.setParent( rootNode );

    					} );


    				}

    			}

    		}

    		return rootNode;

    	} );


    	if ( originalNodes && computedNodes ) {

    		computedNodes.forEach( ( node, index ) => {

    			const children = originalNodes[ index ].children;

    			if ( children ) {

    				children.forEach( ( childNdx ) => {

    					const child = computedNodes[ childNdx ];
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

    					if ( ! computedNodes ) return;

    					const child = computedNodes[ childNdx ];
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

    	const typedArray = this._typedArrayMap[ accessor.componentType ];

    	const buffer = new typedArray( bin, bufferView.byteOffset, bufferView.byteLength / typedArray.BYTES_PER_ELEMENT );

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
