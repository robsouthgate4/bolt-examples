

import IBO from "@/webgl/core/IBO";
import Transform from "@/webgl/core/Transform";
import VAO from "@/webgl/core/VAO";
import VBO from "@/webgl/core/VBO";
import { quat, vec3 } from "gl-matrix";
import Bolt from "../../core/Bolt";

import { GlTf, Mesh, MeshPrimitive } from "./types/GLTF";

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
    	let bin;

    	if ( gltf.buffers ) {

    		bin = await this._loadBinaryBuffer( `${basePath}/${gltf.buffers[ 0 ].uri}` ) as ArrayBufferLike;

    	}

    	if ( gltf.meshes ) {

    		gltf.meshes.forEach( ( mesh: Mesh ) => {

    			mesh.primitives.forEach( ( primitive: MeshPrimitive ) => {

    				const attributes: AttribName = {};

    				let numElements = 0;

    				for ( const [ attribName, index ] of Object.entries( primitive.attributes ) ) {

    					const { accessor, stride, vbo } = this._getAccessorAndVBO( this.gl, gltf, index );

    					const capitalise = ( string: string ) =>
    						string.replaceAll( /\S*/g, word =>
    							`${word.slice( 0, 1 )}${word.slice( 1 ).toLowerCase()}`
    						);

    					attributes[ `a${capitalise( attribName )}` ] = {
    						vbo,
    						type: accessor.componentType,
    						numComponents: this._accessorTypeToNumComponents( accessor.type ),
    						stride,
    						offset: accessor.byteOffset | 0
    					} as AttributeInfo;

    				}

    				const bufferInfo = {
    					attributes,
    					numElements,
    					indices: [],
    					elementType: 0
    				};

    				if ( primitive.indices !== undefined ) {

    					const { accessor, ibo } = this._getAccessorAndIBO( this.gl, gltf, primitive.indices );
    					bufferInfo.numElements = accessor.count;
    					bufferInfo.indices = ibo;
    					bufferInfo.elementType = accessor.componentType;

    				}

    				primitive.bufferInfo = bufferInfo;

    				const vao = new VAO();

    				let index = 0;

    				for ( const [ key, value ] of Object.entries( attributes ) ) {

    					index ++;

    					vao.linkAttrib( value.vbo, index, value.numComponents, this.gl.FLOAT, value.stride, value.offset );

    				}

    				if ( primitive.material ) {

    					primitive.materialBolt = gltf.materials && gltf.materials[ primitive.material ] || undefined;

    				}

    			} );

    		} );

    	}

    	const originalNodes = gltf.nodes;
    	//TODO: complete

    	gltf.nodes = gltf.nodes?.map( ( node ) => {

    		const { name, translation, rotation, scale } = node;

    		console.log( translation );

    		const transfrom = new Transform();
    		transfrom.position = translation ? vec3.fromValues( translation[ 0 ], translation[ 1 ], translation[ 2 ] ) : vec3.create();
    		transfrom.quaternion = rotation ? quat.fromValues( rotation[ 0 ], rotation[ 1 ], rotation[ 2 ], rotation[ 3 ] ) : quat.create();
    		transfrom.scale = scale ? vec3.fromValues( scale[ 0 ], scale[ 1 ], scale[ 2 ] ) : vec3.create();

    		return node;

    	} );


    }

    private _getAccessorAndVBO( gl: WebGL2RenderingContext, gltf: any, accessorIndex: number ) {

    	const accessor = gltf.accessors[ accessorIndex ];
    	const bufferView = gltf.bufferViews[ accessor.bufferView ];

    	if ( ! bufferView.webglBuffer ) {

    		const arrayBuffer = gltf.buffers[ bufferView.buffer ];

    		const data = new Uint8Array( arrayBuffer, bufferView.byteOffset, bufferView.byteLength );

    		const vbo = new VBO( data );
    		bufferView.vbo = vbo;

    	}

    	return {
    		accessor,
    		vbo: bufferView.vbo,
    		stride: bufferView.stride || 0,
    	};

    }

    private _getAccessorAndIBO( gl: WebGL2RenderingContext, gltf: any, accessorIndex: number ) {

    	const accessor = gltf.accessors[ accessorIndex ];
    	const bufferView = gltf.bufferViews[ accessor.bufferView ];

    	if ( ! bufferView.webglBuffer ) {

    		const arrayBuffer = gltf.buffers[ bufferView.buffer ];
    		const data = new Uint8Array( arrayBuffer, bufferView.byteOffset, bufferView.byteLength );

    		const ibo = new IBO( data );
    		bufferView.ibo = ibo;

    	}

    	return {
    		accessor,
    		buffer: bufferView.webglBuffer,
    		ibo: bufferView.ibo,
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
