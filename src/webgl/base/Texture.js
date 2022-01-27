

export default class Texture {

	constructor( {
		imagePath,
		type,
		format,
		pixelType,
		gl
	} ) {

		this.gl = gl;
		this.type = type;
		this.format = format;
		this.pixelType = pixelType;
		this.imagePath = imagePath;

		this.texture = this.gl.createTexture();
		this.gl.bindTexture( this.type, this.texture );
		this.gl.texImage2D( this.type, 0, this.format, 1, 1, 0, this.format, this.pixelType, new Uint8Array( [ 0, 0, 255, 255 ] ) );
		this.gl.texParameteri( this.type, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST );
		this.gl.texParameteri( this.type, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR );

	}

	textureUnit( shader, uniformName, unit ) {

		const textureUnit = this.gl.getUniformLocation( shader.program, uniformName );
		shader.activate();
		this.gl.uniform1i( textureUnit, unit );

	}

	bind() {

		this.gl.bindTexture( this.type, this.texture );

	}

	unbind() {

		this.gl.bindTexture( this.type, null );

	}

	delete() {

		this.gl.deleteTexture( this.texture );

	}

	isPowerOf2( value ) {

		return ( value & ( value - 1 ) ) == 0;

	}

	loadImage() {

		const image = new Image();
		image.src = this.imagePath;

		image.addEventListener( "load", () => {

			if ( this.isPowerOf2( image.width ) && this.isPowerOf2( image.height ) ) {

				// Yes, it's a power of 2. Generate mips.
				this.gl.generateMipmap( this.gl.TEXTURE_2D );

			}

			this.gl.bindTexture( this.type, this.texture );
			this.gl.texImage2D( this.type, 0, this.format, this.format, this.pixelType, image );

			this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE );
			this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE );
			this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR );

			this.gl.bindTexture( this.type, null );

		} );

	}

}
