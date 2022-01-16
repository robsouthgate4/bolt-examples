export default class VBO {

	constructor( { vertices, gl, id } ) {

		this.id = id;
		this.gl = gl;
		this.positionBuffer = this.gl.createBuffer();
		this.gl.bindBuffer( this.gl.ARRAY_BUFFER, this.positionBuffer );
		this.gl.bufferData(
			this.gl.ARRAY_BUFFER,
			new Float32Array( vertices ),
			this.gl.STATIC_DRAW
		);

	}

	bind() {

		this.gl.bindBuffer( this.gl.ARRAY_BUFFER, this.positionBuffer );

	}

	unbind() {

		this.gl.bindBuffer( this.gl.ARRAY_BUFFER, null );

	}

	delete() {

		this.gl.deleteBuffer( this.positionBuffer );

	}

}
