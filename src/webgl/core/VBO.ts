import { mat4 } from "gl-matrix";

export default class VBO {

  gl: WebGL2RenderingContext;
  buffer: WebGLBuffer;

  constructor( data: Float32Array | number[], gl: WebGL2RenderingContext, drawType = gl.STATIC_DRAW ) {

  	this.gl = gl;
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
