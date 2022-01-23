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

		this.vector = vec3.create();
		this.keyPressed = "";

		this.target = vec3.create();
		vec3.add( this.target, this.position, this.forward );

		this.delta = 0;
		this.lastFrame = 0;

		this.newPosition = vec3.create();

		vec3.copy( this.newPosition, this.position );

		this.resize();

		this.initListeners();

	}

	initListeners() {

		window.addEventListener( "keyup", () => {

			this.keyPressed = "";

		} );

		window.addEventListener( "keydown", e => {

			if ( e.key === "w" ) {

				this.keyPressed = "w";

			}

			if ( e.key === "s" ) {

				this.keyPressed = "s";

			}

			if ( e.key === "a" ) {

				this.keyPressed = "a";

			}

			if ( e.key === "d" ) {

				this.keyPressed = "d";

			}

		} );

	}

	resize( width, height ) {

		mat4.perspective( this.projection, this.fov, width / height, this.near, this.far );

	}

	processInputs( delta ) {

		this.cameraSpeed = 3 * delta;

		if ( this.keyPressed === "w" ) {

			const tempForward = vec3.clone( this.forward );

			vec3.multiply( tempForward, tempForward, vec3.fromValues( this.cameraSpeed, this.cameraSpeed, this.cameraSpeed ) );
			vec3.add( this.position, this.position, tempForward );

		}

		if ( this.keyPressed === "s" ) {

			const tempForward = vec3.clone( this.forward );

			vec3.multiply( tempForward, tempForward, vec3.fromValues( this.cameraSpeed, this.cameraSpeed, this.cameraSpeed ) );
			vec3.sub( this.position, this.position, tempForward );

		}

		if ( this.keyPressed === "a" ) {

			const tempPos = vec3.clone( this.position );

			vec3.cross( tempPos, this.forward, this.up );
			vec3.normalize( tempPos, tempPos );

			vec3.multiply( tempPos, tempPos, vec3.fromValues( this.cameraSpeed, this.cameraSpeed, this.cameraSpeed ) );
			vec3.sub( this.position, this.position, tempPos );

		}

		if ( this.keyPressed === "d" ) {

			const tempPos = vec3.clone( this.position );

			vec3.cross( tempPos, this.forward, this.up );
			vec3.normalize( tempPos, tempPos );

			vec3.multiply( tempPos, tempPos, vec3.fromValues( this.cameraSpeed, this.cameraSpeed, this.cameraSpeed ) );
			vec3.add( this.position, this.position, tempPos );

		}


	}

	matrix( elapsed, delta, shader ) {

		this.processInputs( delta );

		vec3.add( this.target, this.position, this.forward );

		mat4.lookAt( this.view, this.position, this.target, this.up );
		mat4.multiply( this.camera, this.projection, this.view );

		const uniformLocationView = this.gl.getUniformLocation( shader.program, "view" );
		this.gl.uniformMatrix4fv( uniformLocationView, false, this.view );

		const uniformLocationProjection = this.gl.getUniformLocation( shader.program, "projection" );
		this.gl.uniformMatrix4fv( uniformLocationProjection, false, this.projection );

		const uniformLocationCamera = this.gl.getUniformLocation( shader.program, "camera" );
		this.gl.uniformMatrix4fv( uniformLocationCamera, false, this.camera );

	}

}
