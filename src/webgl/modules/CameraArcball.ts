import { mat4, vec3 } from "gl-matrix";
import { Camera } from "@bolt-webgl/core";

export default class CameraArcball extends Camera {

    private _mouseDown: boolean;
    private _azimuth: number;
    private _elevation: number;
    private _rotateAmountX: number;
    private _rotationMouseXOnMouseDown: number;
    private _rotationTargetXOnMouseDown: number;
    private _rotateTargetX: number;
    private _rotateTargetY: number;
    private _radius: number;
    private _damping: number;
    private _rotationMouseYOnMouseDown!: number;
    private _rotateAmountY!: number;
    private _rotationTargetYOnMouseDown!: number;
    private _initialPositionSpherical: number[];
    private _scrollSpeed: number;
    private _center: vec3;
    private _shiftKeyDown: boolean;
    private _translateMouseXOnMouseDown: number;
    private _translateMouseYOnMouseDown: number;
    private _translateTargetXOnMouseDown: number;
    private _translateTargetYOnMouseDown: number;
    _translateTargetX: number;
    private _translateTargetY: number;

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
    	this._center = vec3.fromValues( 0, 0, 0 );

    	this._initialPositionSpherical = this.cartesianToSpherical( this.position[ 0 ], this.position[ 1 ], this.position[ 2 ] );

    	this.target = target || vec3.fromValues( 0, 0, 0 );

    	this._mouseDown = false;

    	this._azimuth = this._initialPositionSpherical[ 0 ];
    	this._elevation = this._initialPositionSpherical[ 1 ];
    	this._radius = this._initialPositionSpherical[ 2 ];

    	this._scrollSpeed = scrollSpeed;

    	this._rotateAmountX = speed || 1;
    	this._rotateAmountY = speed || 1;

    	this._rotationMouseXOnMouseDown = 0;
    	this._rotationMouseYOnMouseDown = 0;

    	this._rotationTargetXOnMouseDown = 0;
    	this._rotationTargetYOnMouseDown = 0;

    	this._rotateTargetX = this._azimuth;
    	this._rotateTargetY = this._elevation;

    	this._translateMouseXOnMouseDown = 0;
    	this._translateMouseYOnMouseDown = 0;

    	this._translateTargetXOnMouseDown = 0;
    	this._translateTargetYOnMouseDown = 0;

    	this._translateTargetX = 0;
    	this._translateTargetY = 0;

    	this._damping = damping || 1;

    	this._shiftKeyDown = false;

    	this.resize( window.innerWidth, window.innerHeight );

    	this.initListeners();

    }

    initListeners() {

    	window.addEventListener( "mousemove", this.handleMouseMove.bind( this ) );
    	window.addEventListener( "mousedown", this.handleMouseDown.bind( this ) );
    	window.addEventListener( "mouseup", this.handleMouseUp.bind( this ) );
    	window.addEventListener( "wheel", this.handleWheel.bind( this ) );
    	window.addEventListener( "keydown", this.handleKeyDown.bind( this ) );
    	window.addEventListener( "keyup", this.handleKeyUp.bind( this ) );

    }

    getMousePosition( ev: MouseEvent ) {

    	return {
    		x: ( ev.clientX / window.innerWidth ) * 2 - 1,
    		y: - ( ev.clientY / window.innerHeight ) * 2 + 1,
    	};

    }

    handleKeyDown( ev: KeyboardEvent ) {

    	if ( ev.shiftKey ) {

    		this._shiftKeyDown = true;

    	}

    }

    handleKeyUp() {

    	if ( this._shiftKeyDown ) {

    		this._shiftKeyDown = false;

    	}

    }

    handleWheel( ev: WheelEvent ) {

    	if ( this._shiftKeyDown ) return;

    	const direction = Math.sign( ev.deltaY );
    	this.fov -= ( direction * this._scrollSpeed ) * 0.1;
    	this.fov = Math.min( 45, this.fov );

    	mat4.perspective( this.projection, this.fov, this.width / this.height, this.near, this.far );

    }

    handleMouseDown( ev: MouseEvent ) {

    	this._mouseDown = true;

    	if ( ! this._shiftKeyDown ) {

    		this._rotationMouseXOnMouseDown = this.getMousePosition( ev ).x * this._rotateAmountX;
    		this._rotationMouseYOnMouseDown = this.getMousePosition( ev ).y * this._rotateAmountY;

    		this._rotationTargetXOnMouseDown = this._rotateTargetX;
    		this._rotationTargetYOnMouseDown = this._rotateTargetY;

    	} else {

    		this._translateMouseXOnMouseDown = this.getMousePosition( ev ).x * 3;
    		this._translateMouseYOnMouseDown = this.getMousePosition( ev ).y * 3;

    		this._translateTargetXOnMouseDown = this._translateTargetX;
    		this._translateTargetYOnMouseDown = this._translateTargetY;

    	}

    }

    handleMouseMove( ev: MouseEvent ) {

    	if ( ! this._mouseDown ) return;

    	if ( ! this._shiftKeyDown ) {

    		const mouseX = this.getMousePosition( ev ).x * this._rotateAmountX;
    		const mouseY = this.getMousePosition( ev ).y * this._rotateAmountY;

    		this._rotateTargetX = this._rotationTargetXOnMouseDown + ( mouseX - this._rotationMouseXOnMouseDown );
    		this._rotateTargetY = this._rotationTargetYOnMouseDown - ( mouseY - this._rotationMouseYOnMouseDown );

    		this._rotateTargetX = this._rotationTargetXOnMouseDown + ( mouseX - this._rotationMouseXOnMouseDown );
    		this._rotateTargetY = this._rotationTargetYOnMouseDown - ( mouseY - this._rotationMouseYOnMouseDown );

    	} else {

    		const mouseX = this.getMousePosition( ev ).x * 3;
    		const mouseY = this.getMousePosition( ev ).y * 3;

    		this._translateTargetX = this._translateTargetXOnMouseDown + ( mouseX - this._translateMouseXOnMouseDown );
    		this._translateTargetY = this._translateTargetYOnMouseDown - ( mouseY - this._translateMouseYOnMouseDown );

    		this._translateTargetX = this._translateTargetXOnMouseDown + ( mouseX - this._translateMouseXOnMouseDown );
    		this._translateTargetY = this._translateTargetYOnMouseDown - ( mouseY - this._translateMouseYOnMouseDown );

    	}



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

    	direction[ 0 ] = this._center[ 0 ] + ( this._radius * cosineElevation * cosineAzimuth );
    	direction[ 1 ] = this._center[ 1 ] + this._radius * sineElevation;
    	direction[ 2 ] = this._center[ 2 ] + this._radius * cosineElevation * sineAzimuth;

    	this.forward = direction;

    	return direction;

    }

    resize( width: number, height: number ) {

    	mat4.perspective( this.projection, this.fov, width / height, this.near, this.far );

    	this.width = width;
    	this.height = height;

    }

    update() {


    	this._center[ 0 ] += ( - this._translateTargetX - this._center[ 0 ] ) * this._damping;
    	this._center[ 2 ] += ( - this._translateTargetY - this._center[ 2 ] ) * this._damping;
    	//this._center[ 2 ] += ( 0 - this._center[ 2 ] ) * this._damping;

    	this._azimuth += ( this._rotateTargetX - this._azimuth ) * this._damping;
    	this._elevation += ( this._rotateTargetY - this._elevation ) * this._damping;

    	this._elevation = Math.max( this._elevation, 0 );
    	this._elevation = Math.min( Math.PI / 2, this._elevation );

    	// generate spherical coordinates for new position
    	this.position[ 0 ] = this.spherialToCartesian()[ 0 ];
    	this.position[ 1 ] = this.spherialToCartesian()[ 1 ];
    	this.position[ 2 ] = this.spherialToCartesian()[ 2 ];

    	const target = vec3.create();

    	vec3.add( target, this.target, this._center );

    	mat4.lookAt( this.view, this.position, target, this.up );
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
