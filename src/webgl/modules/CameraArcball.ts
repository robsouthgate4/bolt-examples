import { mat4, vec3 } from "gl-matrix";
import { Camera } from "@robsouthgate/bolt-core";

export default class CameraArcball extends Camera {

    private _mouseDown: boolean;
    private _azimuth: number;
    private _elevation: number;
    private _rotateAmountX: number;
    private _mouseXOnMouseDown: number;
    private _targetXOnMouseDown: number;
    private _targetX: number;
    private _targetY: number;
    private _radius: number;
    private _damping: number;
    private _mouseYOnMouseDown!: number;
    private _rotateAmountY!: number;
    private _targetYOnMouseDown!: number;
    private _initialPositionSpherical: number[];
    private _scrollSpeed: number;

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

    	this._initialPositionSpherical = this.cartesianToSpherical( this.position[ 0 ], this.position[ 1 ], this.position[ 2 ] );

    	this.target = target || vec3.fromValues( 0, 0, 0 );

    	this._mouseDown = false;

    	this._azimuth = this._initialPositionSpherical[ 0 ];
    	this._elevation = this._initialPositionSpherical[ 1 ];
    	this._radius = this._initialPositionSpherical[ 2 ];

    	this._scrollSpeed = scrollSpeed;

    	this._rotateAmountX = speed || 1;
    	this._rotateAmountY = speed || 1;

    	this._mouseXOnMouseDown = 0;
    	this._mouseYOnMouseDown = 0;

    	this._targetXOnMouseDown = 0;
    	this._targetYOnMouseDown = 0;

    	this._targetX = this._azimuth;
    	this._targetY = this._elevation;

    	this._damping = damping || 1;

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
    	this.fov -= ( direction * this._scrollSpeed ) * 0.1;
    	this.fov = Math.min( 45, this.fov );

    	mat4.perspective( this.projection, this.fov, this.width / this.height, this.near, this.far );

    }

    handleMouseDown( ev: MouseEvent ) {

    	this._mouseDown = true;

    	this._mouseXOnMouseDown = this.getMousePosition( ev ).x * this._rotateAmountX;
    	this._mouseYOnMouseDown = this.getMousePosition( ev ).y * this._rotateAmountY;

    	this._targetXOnMouseDown = this._targetX;
    	this._targetYOnMouseDown = this._targetY;

    }

    handleMouseMove( ev: MouseEvent ) {

    	if ( ! this._mouseDown ) return;

    	const mouseX = this.getMousePosition( ev ).x * this._rotateAmountX;
    	const mouseY = this.getMousePosition( ev ).y * this._rotateAmountY;

    	this._targetX = this._targetXOnMouseDown + ( mouseX - this._mouseXOnMouseDown );
    	this._targetY = this._targetYOnMouseDown - ( mouseY - this._mouseYOnMouseDown );


    }

    handleMouseUp() {

    	this._mouseDown = false;

    }

    cartesianToSpherical( y: number, x: number, z: number ) {

    	const radius = Math.sqrt( x * x + y * y + z * z );
    	let elevation;
    	let azimuth;

    	if ( this._radius === 0 ) {

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

    	const sineAzimuth = Math.sin( this._azimuth );
    	const cosineAzimuth = Math.cos( this._azimuth );
    	const sineElevation = Math.sin( this._elevation );
    	const cosineElevation = Math.cos( this._elevation );

    	direction[ 0 ] = ( this._radius * cosineElevation * cosineAzimuth );
    	direction[ 1 ] = this._radius * sineElevation;
    	direction[ 2 ] = this._radius * cosineElevation * sineAzimuth;

    	this.forward = direction;

    	return direction;

    }

    resize( width: number, height: number ) {

    	mat4.perspective( this.projection, this.fov, width / height, this.near, this.far );

    	this.width = width;
    	this.height = height;

    }



    update() {

    	this._azimuth += ( this._targetX - this._azimuth ) * this._damping;
    	this._elevation += ( this._targetY - this._elevation ) * this._damping;

    	this._elevation = Math.max( this._elevation, 0 );
    	this._elevation = Math.min( Math.PI / 2, this._elevation );

    	// generate spherical coordinates for new position
    	this.position[ 0 ] = this.spherialToCartesian()[ 0 ];
    	this.position[ 1 ] = this.spherialToCartesian()[ 1 ];
    	this.position[ 2 ] = this.spherialToCartesian()[ 2 ];

    	mat4.lookAt( this.view, this.position, this.target, this.up );
    	mat4.multiply( this.camera, this.projection, this.view );

    }

    public get radius(): number {

    	return this._radius;

    }
    public set radius( value: number ) {

    	this._radius = value;

    }

    public get scrollSpeed(): number {

    	return this._scrollSpeed;

    }
    public set scrollSpeed( value: number ) {

    	this._scrollSpeed = value;

    }
    public get damping(): number {

    	return this._damping;

    }
    public set damping( value: number ) {

    	this._damping = value;

    }

}
