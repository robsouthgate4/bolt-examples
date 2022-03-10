import Shader from "@/webgl/core/Shader";
import { Pass } from "./Pass";


import FBO from "@/webgl/core/FBO";
import ArrayBuffer from "@/webgl/core/ArrayBuffer";

interface ShaderPassParams {
  width: number;
  height: number;
  shader: Shader
}

export default class ShaderPass extends Pass {

  shader!: Shader;

  constructor( gl: WebGL2RenderingContext, {
  	width = 256,
  	height = 256,
  	shader
  }: ShaderPassParams ) {

  	super( gl, {
  		width,
  		height
  	} );

  	this.shader = shader;
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

  draw( readFBO?: FBO, renderToScreen?: boolean ) {

  	if ( ! renderToScreen ) {

  		this.fbo.bind();

  	}

  	if ( ! readFBO ) {

  		this.shader.setTexture( "map", this.fbo.targetTexture );

  	} else {

  		this.shader.setTexture( "map", readFBO.targetTexture );

  	}

  	this.fullScreenTriangle.drawTriangles( this.shader );

  	this.fbo.unbind();


  }

}
