
import Bolt from "../../core/Bolt";

import { GlTf, Mesh } from "./types/GLTF";

interface AccessorDict {
    [id: string]: number;
}


export default class GLTFLoader {

    bolt: Bolt;

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

    			console.log( mesh );

    		} );

    	}


    }

    _getAccessorAndWebGLBuffer( gl: WebGL2RenderingContext, gltf: any, accessorIndex: number ) {

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
