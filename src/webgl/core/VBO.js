export default class VBO {

	constructor( { data, gl, id } ) {

		this.id = id;
		this.gl = gl;
		this.buffer = this.gl.createBuffer();
		this.gl.bindBuffer( this.gl.ARRAY_BUFFER, this.buffer );

		if ( data instanceof Float32Array ) {

			this.gl.bufferData(
				this.gl.ARRAY_BUFFER,
				data,
				this.gl.STATIC_DRAW
			);

		} else {

			this.gl.bufferData(
				this.gl.ARRAY_BUFFER,
				new Float32Array( data ),
				this.gl.STATIC_DRAW
			);

		}


	}

	bind() {

		this.gl.bindBuffer( this.gl.ARRAY_BUFFER, this.buffer );

	}

	unbind() {

		this.gl.bindBuffer( this.gl.ARRAY_BUFFER, null );

	}

	delete() {

		this.gl.deleteBuffer( this.buffer );

	}

}
