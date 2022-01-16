export default class IBO {

	constructor( { indices, gl } ) {

		this.gl = gl;
		this.indicesBuffer = this.gl.createBuffer();
		this.gl.bindBuffer( this.gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer );
		this.gl.bufferData(
			this.gl.ELEMENT_ARRAY_BUFFER,
			new Uint16Array( indices ),
			this.gl.STATIC_DRAW
		);

	}

	bind() {

		this.gl.bindBuffer( this.gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer );

	}

	unbind() {

		this.gl.bindBuffer( this.gl.ELEMENT_ARRAY_BUFFER, null );

	}

	delete() {

		this.gl.deleteBuffer( this.indicesBuffer );

	}

}
