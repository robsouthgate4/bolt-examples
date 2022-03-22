

import Bolt from "../../core/Bolt";

import { GlTf, Mesh, MeshPrimitive } from "./types/GLTF";

interface AccessorDict {
    [id: string]: number;
}

interface AttributeInfo {
    buffer: WebGLBuffer;
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

    					const { accessor, buffer, stride } = this._getAccessorAndWebGLBuffer( this.gl, gltf, index );

    					const capitalise = ( string: string ) =>
    						string.replaceAll( /\S*/g, word =>
    							`${word.slice( 0, 1 )}${word.slice( 1 ).toLowerCase()}`
    						);

    					attributes[ `a${capitalise( attribName )}` ] = {
    						buffer,
    						type: accessor.componentType,
    						numComponents: this._accessorTypeToNumComponents( accessor.type ),
    						stride,
    						offset: accessor.byteOffset | 0
    					};

    				}

    				const bufferInfo = {
    					attributes,
    					numElements,
    					indices: [],
    					elementType: 0
    				};

    				if ( primitive.indices !== undefined ) {

    					const { accessor, buffer } = this._getAccessorAndWebGLBuffer( this.gl, gltf, primitive.indices );
    					bufferInfo.numElements = accessor.count;
    					bufferInfo.indices = buffer;
    					bufferInfo.elementType = accessor.componentType;

    				}

    				primitive.bufferInfo = bufferInfo;

    				for ( const [ key, value ] of Object.entries( attributes ) ) {

    					console.log( `${key}: ${value}` );
    					console.log( value.buffer );
    					console.log( value.numComponents );
    					//this.gl.bindBuffer( this.gl.ARRAY_BUFFER, value );
    					//this.gl.enableVertexAttribArray( layoutID );
    					// vao.linkAttrib(new)

    				}



    			} );

    		} );

    	}


    }

    private _getAccessorAndWebGLBuffer( gl: WebGL2RenderingContext, gltf: any, accessorIndex: number ) {

    	const accessor = gltf.accessors[ accessorIndex ];
    	const bufferView = gltf.bufferViews[ accessor.bufferView ];
    	if ( ! bufferView.webglBuffer ) {

    		const buffer = gl.createBuffer();
    		const target = bufferView.target || gl.ARRAY_BUFFER;
    		const arrayBuffer = gltf.buffers[ bufferView.buffer ];
    		const data = new Uint8Array( arrayBuffer, bufferView.byteOffset, bufferView.byteLength );

    		gl.bindBuffer( target, buffer );
    		gl.bufferData( target, data, gl.STATIC_DRAW );
    		bufferView.webglBuffer = buffer;

    	}

    	return {
    		accessor,
    		buffer: bufferView.webglBuffer,
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
