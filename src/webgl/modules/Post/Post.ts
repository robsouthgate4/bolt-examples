
import FXAAPass from "./passes/FXAAPass";
import { Pass } from "./passes/Pass";
import RenderPass from "./passes/RenderPass";
import RGBSplitPass from "./passes/RGBSplitPass";

export default class Post {

  gl: WebGL2RenderingContext;
  height: number;
  width: number;
  _passes: Pass[] = [];
  renderPass: RenderPass;
  rbgSplit: RGBSplitPass;
  fxaa: FXAAPass;

  constructor( gl: WebGL2RenderingContext ) {

  	this.gl = gl;

  	this.width = window.innerWidth;
  	this.height = window.innerHeight;

  	this.renderPass = new RenderPass( this.gl, {
  		width: this.width,
  		height: this.height
  	} );

  	this.fxaa = new FXAAPass( this.gl, {
  		width: this.width,
  		height: this.height
  	} );

  	this.rbgSplit = new RGBSplitPass( this.gl, {
  		width: this.width,
  		height: this.height
  	} );

  	this._passes = [];

  }

  add( pass: Pass ) {

  	this._passes.push( pass );

  }

  resize() {

  	return;

  }

  begin() {

  	this.renderPass.fbo.bind();
  	this.gl.enable( this.gl.DEPTH_TEST );

  }

  end() {

  	this.renderPass.fbo.unbind();

  	this.gl.disable( this.gl.DEPTH_TEST ); // prevent discarding triangle

  	this.rbgSplit.draw( this.renderPass.fbo );
  	this.fxaa.draw( this.rbgSplit.fbo );

  }

}
