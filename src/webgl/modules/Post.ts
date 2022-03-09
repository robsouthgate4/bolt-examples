import FBO from "../core/FBO";
import Shader from "../core/Shader";

import postVertexShader from "../core/shaders/post/post.vert";
import postFragmentShader from "../core/shaders/post/post.frag";
import RBO from "../core/RBO";
import ArrayBuffer from "../core/ArrayBuffer";
import { vec2 } from "gl-matrix";

export default class Post {

  fbo: FBO;
  gl: WebGL2RenderingContext;
  rbo: WebGLRenderbuffer;
  height: number;
  width: number;
  shader: Shader;
  fullScreenTriangle: ArrayBuffer;

  constructor( gl: WebGL2RenderingContext ) {

  	this.gl = gl;

  	this.width = window.innerWidth;
  	this.height = window.innerHeight;

  	this.fbo = new FBO( this.gl, { width: this.width, height: this.height } );
  	this.fbo.bind();

  	this.rbo = new RBO( this.gl, { width: this.width, height: this.height } );
  	this.fbo.unbind();

  	const triangleVertices = [
  		- 1, - 1, 0, - 1, 4, 0, 4, - 1, 0
  	];

  	const triangleIndices = [
  		2, 1, 0
  	];

  	this.fullScreenTriangle = new ArrayBuffer( this.gl, {
  		positions: triangleVertices,
  		indices: triangleIndices
  	} );

  	this.shader = new Shader( postVertexShader, postFragmentShader, this.gl );
  	this.shader.activate();
  	this.shader.setTexture( "map", this.fbo.targetTexture );
  	this.shader.setVector2( "resolution", vec2.fromValues( this.width, this.height ) );

  }

  add() {

  	return;

  }

  resize() { //TODO: add fbo resize logic

  	return;

  }

  begin() {

  	this.fbo.bind();
  	this.gl.enable( this.gl.DEPTH_TEST );

  }

  end() {

  	this.fbo.unbind();

  	this.gl.disable( this.gl.DEPTH_TEST ); // prevent discarding triangle

  	this.shader.activate();
  	this.fullScreenTriangle.drawTriangles( this.shader );

  }

}
