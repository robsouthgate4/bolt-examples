import { mat4, vec3 } from "gl-matrix";
import { Camera } from "@robsouthgate/bolt-core";

export default class CameraArcball extends Camera {

    firstMouse: boolean;
    mouseDown: boolean;
    mouseX: number;
    lastX: number;
    azimuth: number;
    elevation: number;
    rotateAmountX: number;
    mouseXOnMouseDown: number;
    targetXOnMouseDown: number;
    targetX: number;
    targetY: number;
    radius: number;
    damping: number;
    mouseYOnMouseDown!: number;
    rotateAmountY!: number;
    targetYOnMouseDown!: number;
    mouseY: number;
    lastY: number;
    initialPositionSpherical: number[];
    scrollSpeed: number;

    constructor(
    	width: number,
    	height: number,
    	position: vec3,
    	target: vec3,
    	fov: number,
    	near: number,
    	far: number,
    	damping = 0.2,
    	speed = 3,
    	scrollSpeed = 0.3 ) {

    	super(
    		width,
    		height,
    		position,
    		fov,
    		near,
    		far
    	);

    	this.position = position;

    	this.initialPositionSpherical = this.cartesianToSpherical( this.position[ 0 ], this.position[ 1 ], this.position[ 2 ] );

    	this.target = target || vec3.fromValues( 0, 0, 0 );

    	this.firstMouse = true;
    	this.mouseDown = false;
    	this.mouseX = 0;
    	this.mouseY = 0;
    	this.lastX = 0;
    	this.lastY = 0;

    	this.azimuth = this.initialPositionSpherical[ 0 ];
    	this.elevation = this.initialPositionSpherical[ 1 ];
    	this.radius = this.initialPositionSpherical[ 2 ];

    	this.scrollSpeed = scrollSpeed;

    	this.rotateAmountX = speed || 1;
    	this.rotateAmountY = speed || 1;

    	this.mouseXOnMouseDown = 0;
    	this.mouseYOnMouseDown = 0;

    	this.targetXOnMouseDown = 0;
    	this.targetYOnMouseDown = 0;

    	this.targetX = this.azimuth;
    	this.targetY = this.elevation;

    	this.damping = damping || 1;

    	this.resize( window.innerWidth, window.innerHeight );

    	this.initListeners();

    }

    initListeners() {

    	window.addEventListener( "mousemove", this.handleMouseMove.bind( this ) );
    	window.addEventListener( "mousedown", this.handleMouseDown.bind( this ) );
    	window.addEventListener( "mouseup", this.handleMouseUp.bind( this ) );
    	window.addEventListener( "wheel", this.handleWheel.bind( this ) );

    }

    getMousePosition( ev: MouseEvent ) {

    	return {
    		x: ( ev.clientX / window.innerWidth ) * 2 - 1,
    		y: - ( ev.clientY / window.innerHeight ) * 2 + 1,
    	};

    }

    handleWheel( ev: WheelEvent ) {

    	const direction = Math.sign( ev.deltaY );
    	this.radius -= direction * this.scrollSpeed;
    	this.radius = Math.max( this.radius, 0 );

    }

    handleMouseDown( ev: MouseEvent ) {

    	this.mouseDown = true;

    	this.mouseXOnMouseDown = this.getMousePosition( ev ).x * this.rotateAmountX;
    	this.mouseYOnMouseDown = this.getMousePosition( ev ).y * this.rotateAmountY;

    	this.targetXOnMouseDown = this.targetX;
    	this.targetYOnMouseDown = this.targetY;

    }

    handleMouseMove( ev: MouseEvent ) {

    	if ( ! this.mouseDown ) return;

    	const mouseX = this.getMousePosition( ev ).x * this.rotateAmountX;
    	const mouseY = this.getMousePosition( ev ).y * this.rotateAmountY;

    	this.targetX = this.targetXOnMouseDown + ( mouseX - this.mouseXOnMouseDown );
    	this.targetY = this.targetYOnMouseDown - ( mouseY - this.mouseYOnMouseDown );


    }

    handleMouseUp() {

    	this.mouseDown = false;

    }

    cartesianToSpherical( y: number, x: number, z: number ) {

    	const radius = Math.sqrt( x * x + y * y + z * z );
    	let elevation;
    	let azimuth;

    	if ( this.radius === 0 ) {

    		elevation = 0;
    		azimuth = 0;

    	} else {

    		elevation = Math.atan2( x, z );
    		azimuth = Math.acos( Math.min( Math.max( y / radius, - 1 ), 1 ) );

    	}

    	return [ azimuth, elevation, radius ];

    }

    spherialToCartesian() {

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

    resize( width: number, height: number ) {

    	mat4.perspective( this.projection, this.fov, width / height, this.near, this.far );

    }



    update() {

    	this.azimuth += ( this.targetX - this.azimuth ) * this.damping;
    	this.elevation += ( this.targetY - this.elevation ) * this.damping;

    	this.elevation = Math.max( this.elevation, 0 );
    	this.elevation = Math.min( Math.PI / 2, this.elevation );

    	// generate spherical coordinates for new position
    	this.position[ 0 ] = this.spherialToCartesian()[ 0 ];
    	this.position[ 1 ] = this.spherialToCartesian()[ 1 ];
    	this.position[ 2 ] = this.spherialToCartesian()[ 2 ];

    	mat4.lookAt( this.view, this.position, this.target, this.up );
    	mat4.multiply( this.camera, this.projection, this.view );

    }

}
