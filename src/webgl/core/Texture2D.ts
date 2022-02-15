import Shader from "./Shader";

export default class Texture {

  imagePath: string;
  pixelType: number;
  format: number;
  gl: WebGL2RenderingContext;
  texture: WebGLTexture;
  wrapT!: number;
  wrapS!: number;

  constructor(
  	imagePath : string,
  	gl: WebGL2RenderingContext,
  	wrapS?: number,
  	wrapT?: number,
  ) {

  	this.gl = gl;
  	this.format = this.gl.RGBA;
  	this.pixelType = this.gl.UNSIGNED_BYTE;
  	this.imagePath = imagePath;

  	this.wrapT = wrapT || this.gl.CLAMP_TO_EDGE;
  	this.wrapS = wrapS || this.gl.CLAMP_TO_EDGE;

  	this.texture = <WebGLTexture>( this.gl.createTexture() );

  	this.bind();

  	this.gl.texImage2D( this.gl.TEXTURE_2D, 0, this.format, 1, 1, 0, this.format, this.gl.UNSIGNED_BYTE, new Uint8Array( [ 0, 0, 255, 255 ] ) );
  	this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST );
  	this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR );

  	this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.wrapS );
  	this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.wrapT );

  }

  textureUnit( shader: Shader, uniformName: string, unit: number ) {


  	shader.activate();
  	const textureUnit = this.gl.getUniformLocation( shader.program, uniformName );
  	this.gl.activeTexture( this.gl.TEXTURE0 + unit );
  	this.bind();
  	this.gl.uniform1i( textureUnit, unit );


  }

  setWrapS( value: number ) {

  	this.bind();
  	this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, value );
  	this.unbind();

  }

  setWrapT( value: number ) {

  	this.bind();
  	this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, value );
  	this.unbind();

  }

  bind() {

  	this.gl.bindTexture( this.gl.TEXTURE_2D, this.texture );

  }

  unbind() {

  	this.gl.bindTexture( this.gl.TEXTURE_2D, null );

  }

  delete() {

  	this.gl.deleteTexture( this.texture );

  }

  isPowerOf2( value: number ) {

  	return ( value & ( value - 1 ) ) == 0;

  }

  loadImage() {

  	const image = new Image();
  	image.src = this.imagePath;

  	image.addEventListener( "load", () => {

  		this.gl.bindTexture( this.gl.TEXTURE_2D, this.texture );
  		this.gl.texImage2D( this.gl.TEXTURE_2D, 0, this.format, this.format, this.pixelType, image );

  		this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.wrapS );
  		this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.wrapT );
  		this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR );

  		if ( this.isPowerOf2( image.width ) && this.isPowerOf2( image.height ) ) {

  			this.gl.generateMipmap( this.gl.TEXTURE_2D );

  		}

  		this.gl.bindTexture( this.gl.TEXTURE_2D, null );

  	} );

  }

}