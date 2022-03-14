
import Bolt from "./Bolt";
export default class VBO {

    gl: WebGL2RenderingContext;
    buffer: WebGLBuffer;

    constructor( data: Float32Array | number[], drawType = Bolt.getInstance().gl.STATIC_DRAW ) {

    	this.gl = Bolt.getInstance().gl;
    	this.buffer = <WebGLBuffer>( this.gl.createBuffer() );
    	this.gl.bindBuffer( this.gl.ARRAY_BUFFER, this.buffer );

    	if ( data instanceof Float32Array ) {

    		this.gl.bufferData(
    			this.gl.ARRAY_BUFFER,
    			data,
    			drawType
    		);

    	} else {

    		this.gl.bufferData(
    			this.gl.ARRAY_BUFFER,
    			new Float32Array( data ),
    			drawType
    		);

    	}


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
