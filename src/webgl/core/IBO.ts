export default class IBO {

  gl: WebGL2RenderingContext;
  indicesBuffer: WebGLBuffer | null;

  constructor( indices: Uint16Array | number[], gl: WebGL2RenderingContext ) {

  	this.gl = gl;
  	this.indicesBuffer = this.gl.createBuffer();
  	this.gl.bindBuffer( this.gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer );

  	if ( indices instanceof Uint16Array ) {

  		this.gl.bufferData(
  			this.gl.ELEMENT_ARRAY_BUFFER,
  			indices,
  			this.gl.STATIC_DRAW
  		);

  	} else {

  		this.gl.bufferData(
  			this.gl.ELEMENT_ARRAY_BUFFER,
  			new Uint16Array( indices ),
  			this.gl.STATIC_DRAW
  		);

  	}

  }

  bind() {

  	this.gl.bindBuffer( this.gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer );

  }

  unbind() {

  	this.gl.bindBuffer( this.gl.ELEMENT_ARRAY_BUFFER, null );

  }

  delete() {

  	this.gl.deleteBuffer( this.indicesBuffer );

  }

}