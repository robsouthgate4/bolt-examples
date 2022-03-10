import Bolt from "./Bolt";

export default class RBO {

  width = 256;
  height = 256;
  gl: WebGL2RenderingContext;
  renderBuffer: WebGLRenderbuffer;

  constructor(
  	{
  		width = 256,
  		height = 256,
  	} = {}
  ) {

  	this.gl = Bolt.getInstance().gl;

  	this.renderBuffer = <WebGLRenderbuffer> this.gl.createRenderbuffer();
  	this.bind();
  	this.gl.renderbufferStorage( this.gl.RENDERBUFFER, this.gl.DEPTH24_STENCIL8, width, height );
  	this.gl.framebufferRenderbuffer( this.gl.FRAMEBUFFER, this.gl.DEPTH_STENCIL_ATTACHMENT, this.gl.RENDERBUFFER, this.renderBuffer );

  }

  resize( width: number, height: number ) {

  	this.gl.bindRenderbuffer( this.gl.RENDERBUFFER, this.renderBuffer );
  	this.gl.renderbufferStorage( this.gl.RENDERBUFFER, this.gl.DEPTH24_STENCIL8, width, height );
  	this.gl.bindRenderbuffer( this.gl.RENDERBUFFER, null );

  }

  bind() {

  	this.gl.bindRenderbuffer( this.gl.RENDERBUFFER, this.renderBuffer );

  }

  unbind() {

  	this.gl.bindRenderbuffer( this.gl.RENDERBUFFER, null );

  }

}
