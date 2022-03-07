import Texture from "./Texture";

export default class FBO {

  width = 256;
  height = 256;
  gl: WebGL2RenderingContext;
  format: number;
  targetTexture: Texture;
  frameBuffer: WebGLFramebuffer;

  constructor(
  	gl: WebGL2RenderingContext,
  	format: number,
  	{
  		width = 256,
  		height = 256,
  	} = {}
  ) {

  	this.gl = gl;
  	this.format = format || this.gl.RGBA;

  	this.targetTexture = new Texture( this.gl, { width, height } );
  	this.targetTexture.bind();

  	this.frameBuffer = <WebGLFramebuffer>( this.gl.createFramebuffer() );
  	this.gl.bindFramebuffer( this.gl.FRAMEBUFFER, this.frameBuffer );

  	const attachment = this.gl.COLOR_ATTACHMENT0;

  	this.gl.framebufferTexture2D( this.gl.FRAMEBUFFER, attachment, this.gl.TEXTURE_2D, this.targetTexture.texture, 0 );

  	this.unbind();

  }

  bind() {

  	this.gl.bindFramebuffer( this.gl.FRAMEBUFFER, this.frameBuffer );

  }

  unbind() {

  	this.gl.bindFramebuffer( this.gl.FRAMEBUFFER, null );

  }

}
