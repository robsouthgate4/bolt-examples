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

	activate() {

		this.gl.useProgram( this.program );

	}

	delete() {

		this.gl.deleteProgram( this.program );

	}

}
