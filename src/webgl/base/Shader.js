export default class Shader {

	constructor( { vertexShader, fragmentShader, gl } ) {

		this.gl = gl;

		this.vertexShader = this.gl.createShader( this.gl.VERTEX_SHADER );
		this.gl.shaderSource( this.vertexShader, vertexShader );
		this.gl.compileShader( this.vertexShader );

		const vertexLogs = this.gl.getShaderInfoLog( this.vertexShader );

		if ( vertexLogs.length > 0 ) {

			throw vertexLogs;

		}

		this.fragmentShader = this.gl.createShader( this.gl.FRAGMENT_SHADER );
		this.gl.shaderSource( this.fragmentShader, fragmentShader );
		this.gl.compileShader( this.fragmentShader );

		const fragmentLogs = this.gl.getShaderInfoLog( this.fragmentShader );

		if ( fragmentLogs.length > 0 ) {

			throw fragmentLogs;

		}

		this.program = this.gl.createProgram();
		this.gl.attachShader( this.program, this.vertexShader );
		this.gl.attachShader( this.program, this.fragmentShader );

		this.gl.linkProgram( this.program );

		if ( ! this.gl.getProgramParameter( this.program, this.gl.LINK_STATUS ) ) {

			var info = this.gl.getProgramInfoLog( this.program );
			throw 'Could not compile WebGL program. \n\n' + info;

		}

		this.gl.deleteShader( this.vertexShader );
		this.gl.deleteShader( this.fragmentShader );

	}

	setBool( uniform, value ) {

		this.gl.uniform1i( this.gl.getUniformLocation( this.program, uniform ), + value );

	}

	setInt( uniform, value ) {

		this.gl.uniform1i( this.gl.getUniformLocation( this.program, uniform ), value );

	}

	setFloat( uniform, value ) {

		this.gl.uniform1i( this.gl.getUniformLocation( this.program, uniform ), value );

	}

	setVector2( uniform, value ) {

		this.gl.uniform2fv( this.gl.getUniformLocation( this.program, uniform ), value );

	}

	setVector3( uniform, value ) {

		this.gl.uniform3fv( this.gl.getUniformLocation( this.program, uniform ), value );

	}

	setVector4( uniform, value ) {

		this.gl.uniform4fv( this.gl.getUniformLocation( this.program, uniform ), value );

	}

	setMatrix3( uniform, value ) {

		this.gl.uniformMatrix3fv( this.gl.getUniformLocation( this.program, uniform ), value );

	}

	setMatrix4( uniform, value ) {

		this.gl.uniformMatrix4fv( this.gl.getUniformLocation( this.program, uniform ), value );

	}

	activate() {

		this.gl.useProgram( this.program );

	}

	delete() {

		this.gl.deleteProgram( this.program );

	}

}
