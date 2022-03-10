import ArrayBuffer from "@/webgl/core/ArrayBuffer";
import FBO from "@/webgl/core/FBO";
import RBO from "@/webgl/core/RBO";

export abstract class Pass {

  fbo: FBO;
  rbo: RBO;
  fullScreenTriangle: ArrayBuffer;
  private _renderToScreen = false;

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

  set renderToScreen( val: boolean ) {

  	this._renderToScreen = val;

  }

  get renderToScreen(): boolean {

  	return this._renderToScreen;

  }

	abstract draw( readFBO?: FBO, renderToScreen?: boolean ): void

}
