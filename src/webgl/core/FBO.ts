
export default class FBO {

  width = 256;
  height = 256;
  gl: WebGL2RenderingContext;
  format: number;
  targetTexture: WebGLTexture;
  frameBuffer: WebGLFramebuffer;

  constructor(
  	width: number,
  	height: number,
  	format: number,
  	gl: WebGL2RenderingContext
  ) {

  	this.gl = gl;
  	this.width = width;
  	this.height = height;
  	this.format = format || this.gl.RGBA;

  	this.targetTexture = <WebGLTexture>( this.gl.createTexture() );

  	this.gl.bindTexture( this.gl.TEXTURE_2D, this.targetTexture );
  	this.gl.texImage2D( this.gl.TEXTURE_2D, 0, this.format, this.width, this.height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null );

  	this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR );
  	this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE );
  	this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE );

  	this.frameBuffer = <WebGLFramebuffer>( this.gl.createFramebuffer() );
  	this.gl.bindFramebuffer( this.gl.FRAMEBUFFER, this.frameBuffer );

  	const attachment = this.gl.COLOR_ATTACHMENT0;

  	this.gl.framebufferTexture2D( this.gl.FRAMEBUFFER, attachment, this.gl.TEXTURE_2D, this.targetTexture, 0 );

  }

  bind() {

  	this.gl.bindFramebuffer( this.gl.FRAMEBUFFER, this.frameBuffer );

  }

  unbind() {

  	this.gl.bindFramebuffer( this.gl.FRAMEBUFFER, null );

  }

}
