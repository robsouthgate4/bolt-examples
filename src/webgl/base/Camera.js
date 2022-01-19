import { mat4, vec3 } from "gl-matrix";

export default class Camera {

	constructor( {
		width,
		height,
		position,
		gl,
		fov,
		near,
		far
	} ) {

		this.gl = gl;
		this.fov = fov;
		this.near = near;
		this.far = far;
		this.width = width,
		this.height = height;
		this.position = position;

		this.view = mat4.create();
		this.projection = mat4.create();
		this.camera = mat4.create();
		this.up = vec3.fromValues( 0, 1, 0 );
		this.forward = vec3.fromValues( 0, 0, - 1 );

		this.delta = 0;
		this.lastFrame = 0;

		this.newLookPosition = vec3.create();

		vec3.add( this.position, this.position, this.forward );

		this.resize();

		this.initListeners();

	}

	initListeners() {

		window.addEventListener( "keydown", e => {


			const newPosition = vec3.create();

			if ( e.key === "w" ) {

				vec3.copy( newPosition, this.forward );
				vec3.multiply( newPosition, newPosition, vec3.fromValues( 0, 0, 0.1 ) );
				vec3.add( this.position, this.position, newPosition );

			}

			if ( e.key === "s" ) {

				vec3.copy( newPosition, this.forward );
				vec3.multiply( newPosition, newPosition, vec3.fromValues( 0, 0, 0.1 ) );
				vec3.sub( this.position, this.position, newPosition );

			}

			if ( e.key === "a" ) {

				vec3.copy( newPosition, this.forward );
				vec3.cross( newPosition, this.up, this.forward );
				vec3.normalize( newPosition, newPosition );
				vec3.multiply( newPosition, newPosition, vec3.fromValues( 0.1, 0, 0.0 ) );
				vec3.add( this.position, this.position, newPosition );

			}

			if ( e.key === "d" ) {

				vec3.copy( newPosition, this.forward );
				vec3.cross( newPosition, this.up, this.forward );
				vec3.normalize( newPosition, newPosition );
				vec3.multiply( newPosition, newPosition, vec3.fromValues( 0.1, 0, 0.0 ) );
				vec3.sub( this.position, this.position, newPosition );

			}

			vec3.add( this.newLookPosition, this.position, this.forward );

		} );

	}

	resize( width, height ) {

		mat4.perspective( this.projection, this.fov, width / height, this.near, this.far );

	}

	matrix( elapsed, delta, shader ) {

		mat4.lookAt( this.view, this.position, this.newLookPosition, this.up );
		mat4.multiply( this.camera, this.projection, this.view );

		const uniformLocationView = this.gl.getUniformLocation( shader.program, "view" );
		this.gl.uniformMatrix4fv( uniformLocationView, false, this.view );

		const uniformLocationProjection = this.gl.getUniformLocation( shader.program, "projection" );
		this.gl.uniformMatrix4fv( uniformLocationProjection, false, this.projection );

		const uniformLocationCamera = this.gl.getUniformLocation( shader.program, "camera" );
		this.gl.uniformMatrix4fv( uniformLocationCamera, false, this.camera );

	}

}
