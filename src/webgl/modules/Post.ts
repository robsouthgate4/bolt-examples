import FBO from "../core/FBO";
import Shader from "../core/Shader";
import VAO from "../core/VAO";
import VBO from "../core/VBO";

//@ts-ignore
import postVertexShader from "../core/shaders/post/post.vert";
//@ts-ignore
import postFragmentShader from "../core/shaders/post/post.frag";

export default class Post {

  fbo: FBO;
  gl: WebGL2RenderingContext;
  rbo: WebGLRenderbuffer;
  height: number;
  width: number;
  shader: Shader;
  rectVAO: VAO;

  constructor( gl: WebGL2RenderingContext ) {

  	this.gl = gl;

  	this.width = window.innerWidth;
  	this.height = window.innerHeight;

  	this.fbo = new FBO( this.gl, this.gl.RGBA, { width: this.width, height: this.height } );
  	this.fbo.bind();

  	// TODO: convert to class
  	this.rbo = <WebGLRenderbuffer> this.gl.createRenderbuffer();
  	this.gl.bindRenderbuffer( this.gl.RENDERBUFFER, this.rbo );
  	this.gl.renderbufferStorage( this.gl.RENDERBUFFER, this.gl.DEPTH24_STENCIL8, this.width, this.height );
  	this.gl.framebufferRenderbuffer( this.gl.FRAMEBUFFER, this.gl.DEPTH_STENCIL_ATTACHMENT, this.gl.RENDERBUFFER, this.rbo );

  	this.fbo.unbind();

  	const rectangleVertices = [

  		1, - 1, 1, 0,
  		- 1, - 1, 0, 0,
  		- 1, 1, 0, 1,
  		1, 1, 1, 1,
  		1, - 1, 1, 0,
  		- 1, 1, 0, 1

  	];

  	const rectVBO = new VBO( new Float32Array( rectangleVertices ), this.gl );

  	this.rectVAO = new VAO( this.gl );
  	this.rectVAO.bind();

  	// link positions
  	this.rectVAO.linkAttrib( rectVBO, 0, 2, this.gl.FLOAT, 4 * Float32Array.BYTES_PER_ELEMENT, 0 );
  	// link uvs
  	this.rectVAO.linkAttrib( rectVBO, 1, 2, this.gl.FLOAT, 4 * Float32Array.BYTES_PER_ELEMENT, 2 * Float32Array.BYTES_PER_ELEMENT );

  	rectVBO.unbind();
  	this.rectVAO.unbind();

  	this.shader = new Shader( postVertexShader, postFragmentShader, this.gl );
  	this.shader.activate();
  	this.shader.setTexture( "map", this.fbo.targetTexture );


  }
  begin() {

  	this.fbo.bind();
  	this.gl.enable( this.gl.DEPTH_TEST );

  }

  end() {

  	this.fbo.unbind();
  	this.shader.activate();

  	this.rectVAO.bind();
  	this.gl.disable( this.gl.DEPTH_TEST );
  	this.shader.setTexture( "map", this.fbo.targetTexture );

  	this.gl.drawArrays( this.gl.TRIANGLES, 0, 6 );

  }

}
