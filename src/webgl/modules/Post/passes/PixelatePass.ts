import Shader from "@/webgl/core/Shader";
import { Pass } from "./Pass";

import vertexShader from "./shaders/pixelate/pixelate.vert";
import fragmentShader from "./shaders/pixelate/pixelate.frag";
import FBO from "@/webgl/core/FBO";
import ArrayBuffer from "@/webgl/core/ArrayBuffer";

export default class PixelatePass extends Pass {

  shader!: Shader;
  private _xPixels: number;
  private _yPixels: number;

  constructor( gl: WebGL2RenderingContext, {
  	width = 256,
  	height = 256,
  	xPixels = 50,
  	yPixels = 50
  } ) {

  	super( gl, {
  		width,
  		height
  	} );

  	this._xPixels = xPixels;
  	this._yPixels = yPixels;

  	this.shader = new Shader( vertexShader, fragmentShader, gl );
  	this.shader.activate();
  	this.shader.setFloat( "xPixels", this._xPixels );
  	this.shader.setFloat( "yPixels", this._yPixels );
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

  set pixelCountX( x: number ) {

  	this._xPixels = x;
  	this.shader.activate();
  	this.shader.setFloat( "xPixels", x );

  }

  set pixelCountY( y: number ) {

  	this._yPixels = y;
  	this.shader.activate();
  	this.shader.setFloat( "yPixels", y );

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
