import Shader from "@/webgl/core/Shader";
import { Pass } from "./Pass";

import vertexShader from "./shaders/post/post.vert";
import fragmentShader from "./shaders/post/post.frag";
import { vec2 } from "gl-matrix";
import Texture from "@/webgl/core/Texture";
import FBO from "@/webgl/core/FBO";
import ArrayBuffer from "@/webgl/core/ArrayBuffer";

export default class RGBSplitPass extends Pass {

  shader!: Shader;

  constructor( gl: WebGL2RenderingContext, {
  	width = 256,
  	height = 256
  } ) {

  	super( gl, {
  		width,
  		height
  	} );

  	this.shader = new Shader( vertexShader, fragmentShader, gl );
  	this.shader.activate();
  	this.shader.setTexture( "map", this.fbo.targetTexture );


  	const triangleVertices = [
  		- 1, - 1, 0, - 1, 4, 0, 4, - 1, 0
  	];

  	const triangleIndices = [
  		2, 1, 0
  	];

  	this.fullScreenTriangle = new ArrayBuffer( gl, {
  		positions: triangleVertices,
  		indices: triangleIndices
  	} );

  }

  draw( readFBO?: FBO, writeFBO?: FBO ) {

  	this.fbo.bind();

  	if ( ! readFBO ) {

  		this.shader.setTexture( "map", this.fbo.targetTexture );

  	} else {

  		this.shader.setTexture( "map", readFBO.targetTexture );

  	}

  	this.fullScreenTriangle.drawTriangles( this.shader );

  	this.fbo.unbind();


  }

}
