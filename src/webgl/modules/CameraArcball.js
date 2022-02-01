import { mat4, vec3 } from "gl-matrix";
import Camera from "../core/Camera";

export default class CameraArcball extends Camera {

	constructor( {
		width,
		height,
		position,
		target,
		gl,
		fov,
		near,
		far
	} ) {

		super( {
			width,
			height,
			position,
			gl,
			fov,
			near,
			far
		} );

		this.target = target || vec3.fromValues( 0, 0, 0 );

		this.firstMouse = true;
		this.mouseDown = false;
		this.mouseX = 0;
		this.mouseY = 0;
		this.lastX = 0;
		this.lastY = 0;

		this.azimuth = 0;
		this.elevation = 0;

		this.rotateAmountX = 3;
		this.rotateAmountY = 3;

		this.mouseXOnMouseDown = 0;
		this.mouseYOnMouseDown = 0;

		this.targetXOnMouseDown = 0;
		this.targetYOnMouseDown = 0;

		this.targetX = 0;
		this.targetY = Math.PI * 0.25;

		this.radius = 5;

		this.damping = 0.2;

		this.resize();

		this.initListeners();

	}

	initListeners() {

		window.addEventListener( "mousemove", this.handleMouseMove.bind( this ) );
		window.addEventListener( "mousedown", this.handleMouseDown.bind( this ) );
		window.addEventListener( "mouseup", this.handleMouseUp.bind( this ) );

	}

	getMousePosition( ev ) {

		return {
			x: ( ev.clientX / window.innerWidth ) * 2 - 1,
			y: - ( ev.clientY / window.innerHeight ) * 2 + 1,
		};

	}

	handleMouseDown( ev ) {

		this.mouseDown = true;

		this.mouseXOnMouseDown = this.getMousePosition( ev ).x * this.rotateAmountX;
		this.mouseYOnMouseDown = this.getMousePosition( ev ).y * this.rotateAmountY;

		this.targetXOnMouseDown = this.targetX;
		this.targetYOnMouseDown = this.targetY;

	}

	handleMouseMove( ev ) {

		if ( ! this.mouseDown ) return;

		const mouseX = this.getMousePosition( ev ).x * this.rotateAmountX;
		const mouseY = this.getMousePosition( ev ).y * this.rotateAmountY;

		this.targetX = this.targetXOnMouseDown + ( mouseX - this.mouseXOnMouseDown );
		this.targetY = this.targetYOnMouseDown - ( mouseY - this.mouseYOnMouseDown );


	}

	handleMouseUp() {

		this.mouseDown = false;

	}

	generatePosition() {

		const direction = vec3.create();

		const sineAzimuth = Math.sin( this.azimuth );
		const cosineAzimuth = Math.cos( this.azimuth );
		const sineElevation = Math.sin( this.elevation );
		const cosineElevation = Math.cos( this.elevation );

		direction[ 0 ] = this.radius * cosineElevation * cosineAzimuth;
		direction[ 1 ] = this.radius * sineElevation;
		direction[ 2 ] = this.radius * cosineElevation * sineAzimuth;

		return direction;

	}



	resize( width, height ) {

		mat4.perspective( this.projection, this.fov, width / height, this.near, this.far );

	}

	getPosition() {

		return this.position;

	}

	getViewMatrix() {

		return this.view;

	}

	getProjectionMatrix() {

		return this.projection;

	}

	update( ) {

		this.azimuth += ( this.targetX - this.azimuth ) * this.damping;
		this.elevation += ( this.targetY - this.elevation ) * this.damping;

		this.elevation = Math.max( this.elevation, 0 );
		this.elevation = Math.min( Math.PI / 2, this.elevation );

		// generate spherical coordinates for new position
		this.position[ 0 ] = this.generatePosition()[ 0 ];
		this.position[ 1 ] = this.generatePosition()[ 1 ];
		this.position[ 2 ] = this.generatePosition()[ 2 ];

		mat4.lookAt( this.view, this.position, this.target, this.up );
		mat4.multiply( this.camera, this.projection, this.view );

	}

}
