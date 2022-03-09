import Shader from "@/webgl/core/Shader";
import { Pass } from "./Pass";

import vertexShader from "./shaders/fxaa/fxaa.vert";
import fragmentShader from "./shaders/fxaa/fxaa.frag";
import { vec2 } from "gl-matrix";
import FBO from "@/webgl/core/FBO";

export default class RenderPass extends Pass {

  shader!: Shader;

  constructor( gl: WebGL2RenderingContext, {
  	width = 256,
  	height = 256
  } ) {

  	super( gl, {
  		width,
  		height
  	} );

  }

  draw( ) {

  	//this.fbo.bind();

  }

}
