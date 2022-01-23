import { glMatrix, mat4, vec3 } from "gl-matrix";

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

		// vec3.sub( this.direction, this.position, this.target );
		// vec3.normalize( this.direction, this.direction );

		this.yaw = - 90;
		this.pitch = 0;



		this.delta = 0;
		this.lastFrame = 0;
		this.firstMouse = true;
		this.lastX = window.innerWidth / 2;
		this.lastY = window.innerHeight / 2;

		this.newPosition = vec3.create();

		vec3.copy( this.newPosition, this.position );

		this.resize();

		this.initListeners();

	}

	initListeners() {

		window.addEventListener( "mousemove", this.handleMouseMove.bind( this ) );

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

	handleMouseMove( ev ) {

		const xPos = ev.clientX;
		const yPos = ev.clientY;


		if ( this.firstMouse ) {

			this.lastX = xPos;
			this.lastY = yPos;
			this.firstMouse = false;

		}

		let xOffset = xPos - this.lastX;
		let yOffset = this.lastY - yPos;

		this.lastX = xPos;
		this.lastY = yPos;

		const sensitivity = 0.1;
		xOffset *= sensitivity;
		yOffset *= sensitivity;

		console.log( xOffset );

		this.yaw += xOffset;
		this.pitch += yOffset;

		if ( this.pitch > 89.0 )
			this.pitch = 89.0;
		if ( this.pitch < - 89.0 )
			this.pitch = - 89.0;

		const direction = vec3.create();
		direction[ 0 ] = Math.cos( glMatrix.toRadian( this.yaw ) ) * Math.cos( glMatrix.toRadian( this.pitch ) );
		direction[ 1 ] = Math.sin( glMatrix.toRadian( this.pitch ) );
		direction[ 2 ] = Math.sin( glMatrix.toRadian( this.yaw ) ) * Math.cos( glMatrix.toRadian( this.pitch ) );

		vec3.normalize( direction, direction );
		vec3.copy( this.forward, direction );


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
