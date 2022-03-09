export default class IBO {

  gl: WebGL2RenderingContext;
  indicesBuffer: WebGLBuffer | null;
  count: number;

  constructor( gl: WebGL2RenderingContext, indices: Uint16Array | number[], ) {

  	this.gl = gl;
  	this.count = indices.length;
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
