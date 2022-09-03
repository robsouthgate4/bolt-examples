import { vec2, vec3 } from "gl-matrix";
import { Node } from "@bolt-webgl/core";

export default class Orbit {

	private _mouseDown: boolean;
	private _azimuth: number;
	private _elevation: number;
	private _rotateAmountX: number;
	private _mouseXOnDown: number;
	private _rotationTargetXOnMouseDown: number;
	private _rotateTargetX: number;
	private _rotateTargetY: number;
	private _radius: number;
	private _damping: number;
	private _mouseYOnDown!: number;
	private _rotateAmountY!: number;
	private _rotationTargetYOnMouseDown!: number;
	private _initialSpherical: number[];
	private _scrollSpeed: number;
	private _shiftKeyDown: boolean;
	private _node: Node;
	private _offset = vec3.create();
	private _target = vec3.create();
	private _forward = vec3.create();
	private _up = vec3.fromValues( 0, 1, 0 );

	constructor(
		node: Node,
		speed = 3,
		damping = 1,
		scrollSpeed = 0.3 ) {

		this._node = node;
		this._offset = node.transform.position; // 0, 0, 30
		this._target = node.transform.lookTarget; // 0, 2, 0

		// subtract camera target from node position to get offset vector
		vec3.subtract( this._offset, this._offset, this._target ); // 0, -2, 30

		// get radius from lenth of offset
		this._radius = vec3.length( this._offset );

		// get the initail spherical coordinates from offset
		this._initialSpherical = this._cartesianToSpherical(
			this._offset[ 0 ],
			this._offset[ 1 ],
			this._offset[ 2 ] );

		this._mouseDown = false;

		this._azimuth = this._initialSpherical[ 0 ];
		this._elevation = this._initialSpherical[ 1 ];

		this._scrollSpeed = scrollSpeed;
		this._damping = damping;

		this._rotateAmountX = speed || 1;
		this._rotateAmountY = speed || 1;

		this._mouseXOnDown = 0;
		this._mouseYOnDown = 0;

		this._rotationTargetXOnMouseDown = 0;
		this._rotationTargetYOnMouseDown = 0;

		this._rotateTargetX = this._azimuth;
		this._rotateTargetY = this._elevation;

		this._shiftKeyDown = false;

		this._initListeners();

	}

	private _initListeners() {

		window.addEventListener( "mousemove", this._handleMouseMove.bind( this ) );
		window.addEventListener( "mousedown", this._handleMouseDown.bind( this ) );
		window.addEventListener( "mouseup", this._handleMouseUp.bind( this ) );
		window.addEventListener( "wheel", this._handleWheel.bind( this ) );
		window.addEventListener( "keydown", this._handleKeyDown.bind( this ) );
		window.addEventListener( "keyup", this._handleKeyUp.bind( this ) );

	}

	private _getMousePosition( ev: MouseEvent ) {

		return {
			x: ( ev.clientX / window.innerWidth ) * 2 - 1,
			y: - ( ev.clientY / window.innerHeight ) * 2 + 1,
		};

	}

	private _handleKeyDown( ev: KeyboardEvent ) {

		if ( ev.shiftKey ) {

			this._shiftKeyDown = true;

		}

	}

	private _handleKeyUp() {

		if ( this._shiftKeyDown ) {

			this._shiftKeyDown = false;

		}

	}

	private _handleWheel( ev: WheelEvent ) {

		if ( this._shiftKeyDown ) return;

		const direction = Math.sign( ev.deltaY );

		this._radius -= direction * this._scrollSpeed;


	}

	private _handleMouseDown( ev: MouseEvent ) {

		this._mouseDown = true;
		this._mouseXOnDown = this._getMousePosition( ev ).x;
		this._mouseYOnDown = this._getMousePosition( ev ).y;

		if ( ! this._shiftKeyDown ) {

			this._rotationTargetXOnMouseDown = this._rotateTargetX;
			this._rotationTargetYOnMouseDown = this._rotateTargetY;

		} else {



		}

	}

	private _handleMouseMove( ev: MouseEvent ) {

		if ( ! this._mouseDown ) return;

		if ( ! this._shiftKeyDown ) {

			const mouseX = this._getMousePosition( ev ).x * this._rotateAmountX;
			const mouseY = this._getMousePosition( ev ).y * this._rotateAmountY;

			this._rotateTargetX = this._rotationTargetXOnMouseDown + ( mouseX - ( this._mouseXOnDown * this._rotateAmountX ) );
			this._rotateTargetY = this._rotationTargetYOnMouseDown - ( mouseY - ( this._mouseYOnDown * this._rotateAmountY ) );

		} else {

			// TODO: panning

			console.log( this._mouseXOnDown );

			const mouseX = this._getMousePosition( ev ).x - this._mouseXOnDown;
			const mouseY = this._getMousePosition( ev ).y - this._mouseYOnDown;


			const newDirection = vec3.create();

			vec3.cross( newDirection, this._forward, this._up );
			vec3.normalize( newDirection, newDirection );
			vec3.multiply( newDirection, newDirection, vec3.fromValues( 0.1, 0.1, 0.1 ) );

			newDirection[ 0 ] += mouseX;

			vec3.add( this._target, this._target, newDirection );


		}



	}

	private _handleMouseUp() {

		this._mouseDown = false;

	}

	private _cartesianToSpherical( y: number, x: number, z: number ) {

		let elevation;
		let azimuth;

		if ( this._radius === 0 ) {

			elevation = 0;
			azimuth = 0;

		} else {

			elevation = Math.atan2( x, z );
			azimuth = Math.acos( Math.min( Math.max( y / this._radius, - 1 ), 1 ) );

		}

		return [ azimuth, elevation, this._radius ];

	}

	private _spherialToCartesian() {

		const direction = vec3.create();

		const sineAzimuth = Math.sin( this._azimuth );
		const cosineAzimuth = Math.cos( this._azimuth );
		const sineElevation = Math.sin( this._elevation );
		const cosineElevation = Math.cos( this._elevation );

		direction[ 0 ] = this._radius * cosineElevation * cosineAzimuth;
		direction[ 1 ] = this._radius * sineElevation;
		direction[ 2 ] = this._radius * cosineElevation * sineAzimuth;

		vec3.copy( this._forward, direction );
		vec3.normalize( this._forward, this._forward );

		return direction;

	}

	update() {

		//this._azimuth += ( this._rotateTargetX - this._azimuth ) * this._damping;
		//this._elevation += ( this._rotateTargetY - this._elevation ) * this._damping;

		// set new spherical coordinates
		this._azimuth = this._rotateTargetX;
		this._elevation = this._rotateTargetY;

		// this._elevation = Math.max( this._elevation, 0 );
		// this._elevation = Math.min( Math.PI / 2, this._elevation );

		// map spherical coordinates to cartesian
		const newOffset = this._spherialToCartesian();

		// generate spherical coordinates for new position
		this._offset[ 0 ] = newOffset[ 0 ];
		this._offset[ 1 ] = newOffset[ 1 ];
		this._offset[ 2 ] = newOffset[ 2 ];

		// copy camera target to camera position
		this._node.transform.position = vec3.clone( this._target );

		// add the offset back to the camera position
		vec3.add( this._node.transform.position, this._node.transform.position, this._offset );

		// look at the target
		this._node.transform.lookAt( this._target );


	}

	public get node(): Node {

		return this._node;

	}

	public set node( value: Node ) {

		this._node = value;

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
