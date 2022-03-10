import Shader from "@/webgl/core/Shader";
import { Pass } from "./Pass";

import vertexShader from "./shaders/rgbSplit/rgbSplit.vert";
import fragmentShader from "./shaders/rgbSplit/rgbSplit.frag";
import FBO from "@/webgl/core/FBO";
import ArrayBuffer from "@/webgl/core/ArrayBuffer";
import Bolt from "@/webgl/core/Bolt";

export default class RGBSplitPass extends Pass {

  shader!: Shader;

  constructor( bolt: Bolt, {
  	width = 256,
  	height = 256
  } ) {

  	super( bolt, {
  		width,
  		height
  	} );

  	this.shader = new Shader( vertexShader, fragmentShader );
  	this.shader.activate();
  	this.shader.setTexture( "map", this.fbo.targetTexture );


  	const triangleVertices = [
  		- 1, - 1, 0, - 1, 4, 0, 4, - 1, 0
  	];

  	const triangleIndices = [
  		2, 1, 0
  	];

  	this.fullScreenTriangle = new ArrayBuffer( {
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
