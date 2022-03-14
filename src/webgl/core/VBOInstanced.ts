import { mat4 } from "gl-matrix";
import Bolt from "./Bolt";

export default class VBOInstanced {

    gl: WebGL2RenderingContext;
    buffer: WebGLBuffer;

    constructor( data: mat4[], drawType = Bolt.getInstance().gl.STATIC_DRAW ) {

    	this.gl = Bolt.getInstance().gl;
    	this.buffer = <WebGLBuffer>( this.gl.createBuffer() );
    	this.gl.bindBuffer( this.gl.ARRAY_BUFFER, this.buffer );

    	const mergedData = this.bufferjoin( data );

    	this.gl.bufferData(
    		this.gl.ARRAY_BUFFER,
    		mergedData,
    		drawType
    	);


    }

    private sum( a: number[] ) {

    	return a.reduce( function ( a, b ) {

    		return a + b;

    	}, 0 );

    }

    bufferjoin( bufs: mat4[] ) {

    	var lens = bufs.map( function ( a ) {

    		return a.length;

    	} );

    	var aout = new Float32Array( this.sum( lens ) );
    	for ( var i = 0; i < bufs.length; ++ i ) {

    		var start = this.sum( lens.slice( 0, i ) );
    		aout.set( bufs[ i ], start );

    	}

    	return aout;

    }

    bind() {

    	this.gl.bindBuffer( this.gl.ARRAY_BUFFER, this.buffer );

    }

    unbind() {

    	this.gl.bindBuffer( this.gl.ARRAY_BUFFER, null );

    }

    delete() {

    	this.gl.deleteBuffer( this.buffer );

    }

}
