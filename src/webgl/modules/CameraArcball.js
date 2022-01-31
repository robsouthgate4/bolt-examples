import { glMatrix, mat4, vec3 } from "gl-matrix";
import Camera from "../core/Camera";

export default class CameraArcball extends Camera {

	constructor( {
		width,
		height,
		position,
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

		this.target = vec3.fromValues( 0, 0, 0 );
		//vec3.add( this.target, this.position, this.forward );

		this.firstMouse = true;
		this.mouseDown = false;
		this.mouseX = 0;
		this.mouseY = 0;
		this.lastX = 0;
		this.lastY = 0;

		this.azimuth = 0;
		this.elevation = 0;

		this.deltaAzimuth = 0;
		this.deltaElevation = 0;

		this.mouseXOnMouseDown = 0;
		this.mouseYOnMouseDown = 0;

		this.targetXOnMouseDown = 0;
		this.targetYOnMouseDown = 0;

		this.targetX = 0;
		this.targetY = 0;

		this.radius = 5;

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
			normalized: {
				x: ( ev.clientX / window.innerWidth ) * 2 - 1,
				y: - ( ev.clientY / window.innerHeight ) * 2 + 1,
			},
			raw: {
				x: ev.clientX,
				y: ev.clientY,
			},
			rawNormalized: {
				x: ( ev.clientX - window.innerWidth * 0.5 ) * 2,
				y: ( ev.clientY - window.innerHeight * 0.5 ) * 2,
			},
		};

	}

	handleMouseDown( ev ) {

		this.mouseDown = true;

		this.mouseXOnMouseDown = this.getMousePosition( ev ).normalized.x * 3;
		this.mouseYOnMouseDown = this.getMousePosition( ev ).normalized.y * 3;

		this.targetXOnMouseDown = this.targetX;
		this.targetYOnMouseDown = this.targetY;

	}

	handleMouseMove( ev ) {

		if ( ! this.mouseDown ) return;

		const mouseX = this.getMousePosition( ev ).normalized.x * 3;
		const mouseY = this.getMousePosition( ev ).normalized.y * 3;

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
		const sinePolar = Math.sin( this.elevation );
		const cosinePolar = Math.cos( this.elevation );

		direction[ 0 ] = this.radius * cosinePolar * cosineAzimuth;
		direction[ 1 ] = this.radius * sinePolar;
		direction[ 2 ] = this.radius * cosinePolar * sineAzimuth;

		return direction;

	}



	resize( width, height ) {

		mat4.perspective( this.projection, this.fov, width / height, this.near, this.far );

	}

	processInputs( delta ) {

		if ( ! this.active ) return;


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

	update( elapsed, delta ) {

		this.azimuth += ( this.targetX - this.azimuth ) * 0.1;
		this.elevation += ( this.targetY - this.elevation ) * 0.1;

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
