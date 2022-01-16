

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
		//this.gl.activeTexture(this.texture)
		this.gl.bindTexture( this.type, this.texture );
		this.gl.texImage2D( this.type, 0, this.format, 1, 1, 0, this.format, this.pixelType, new Uint8Array( [ 0, 0, 255, 255 ] ) );

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

	loadImage() {

		const image = new Image();
		image.src = this.imagePath;

		image.addEventListener( "load", () => {

			this.gl.bindTexture( this.type, this.texture );
			this.gl.texImage2D( this.type, 0, this.format, this.format, this.pixelType, image );
			this.gl.generateMipmap( this.type );

			this.gl.bindTexture( this.type, null );

		} );

	}

}
