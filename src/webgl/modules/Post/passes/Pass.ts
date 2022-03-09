import ArrayBuffer from "@/webgl/core/ArrayBuffer";
import FBO from "@/webgl/core/FBO";
import RBO from "@/webgl/core/RBO";
import Texture from "@/webgl/core/Texture";

export abstract class Pass {

  fbo: FBO;
  rbo: RBO;
  fullScreenTriangle: ArrayBuffer;

  constructor( gl: WebGL2RenderingContext, {
  	width = 256,
  	height = 256
  } ) {

  	this.fbo = new FBO( gl, { width, height } );
  	this.fbo.bind();

  	this.rbo = new RBO( gl, { width, height } );
  	this.fbo.unbind();

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

	abstract draw( readFBO?: FBO, writeFBO?: FBO ): void

}
