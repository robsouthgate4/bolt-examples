import VBO from "./VBO";

export default class VAO {

  gl: WebGL2RenderingContext;
  vao: WebGLVertexArrayObject;

  constructor( gl: WebGL2RenderingContext ) {

  	this.gl = gl;
  	this.vao = <WebGLVertexArrayObject>( this.gl.createVertexArray() );

  }

  linkVBO( vbo: VBO, layoutID: number ) {

  	vbo.bind();
  	this.gl.vertexAttribPointer( layoutID, 3, this.gl.FLOAT, false, 0, 0 );
  	this.gl.enableVertexAttribArray( layoutID );
  	vbo.unbind();

  }

  linkAttrib( vbo: VBO, layoutID: number, numComponents: number, type: number, stride: number, offset: number ) {

  	vbo.bind();
  	this.gl.vertexAttribPointer( layoutID, numComponents, type, false, stride, offset );
  	this.gl.enableVertexAttribArray( layoutID );
  	vbo.unbind();

  }

  bind() {

  	this.gl.bindVertexArray( this.vao );

  }

  unbind() {

  	this.gl.bindVertexArray( null );

  }

  delete() {

  	this.gl.deleteVertexArray( this.vao );

  }

}
