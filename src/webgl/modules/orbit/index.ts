import { vec3 } from "gl-matrix";
import { Node } from "@bolt-webgl/core";

export default class Orbit {

	private _mouseDown: boolean;
	private _mouseXOnDown: number;
	private _mouseYOnDown!: number;
	private _azimuthStart: number;
	private _elevationStart!: number;
	private _radius!: number;
	private _initialSpherical: number[];
	private _shiftKeyDown: boolean;
	private _node: Node;
	private _offset = vec3.create();
	private _target = vec3.create();
	private _forward = vec3.create();
	private _up = vec3.fromValues( 0, 1, 0 );
	private _ease: number;

	private _sphericalTarget = { radius: 1, azimuth: 0, elevation: 0 };
	private _sphericalCurrent = { radius: 1, azimuth: 0, elevation: 0 };

	private _panTarget = vec3.create();
	private _panStart = vec3.create();
	private _panSpeed: number;
	private _zoomSpeed: number;
	private _rotateSpeed: number;
	private _minElevation: number;
	private _maxElevation: number;
	private _minAzimuth: number;
	private _maxAzimuth: number;

	constructor(
		node: Node,
		{
			panSpeed = 3,
			rotateSpeed = 3,
			ease = 0.25,
			zoomSpeed = 1,
			minElevation = 0,
			maxElevation = Math.PI * 0.5,
			minAzimuth = - Infinity,
			maxAzimuth = Infinity,
		} = {} ) {

		this._ease = ease;
		this._panSpeed = panSpeed;
		this._zoomSpeed = zoomSpeed;
		this._rotateSpeed = rotateSpeed;
		this._minElevation = minElevation;
		this._maxElevation = maxElevation;
		this._minAzimuth = minAzimuth;
		this._maxAzimuth = maxAzimuth;

		this._node = node;
		this._offset = node.transform.position;
		this._target = node.transform.lookTarget;
		this._panTarget = vec3.clone( this._target );

		// subtract camera target from node position to get offset vector
		vec3.subtract( this._offset, this._offset, this._target ); // 0, -2, 30

		const rad = vec3.length( this._offset );

		// get radius from length of offset
		this._sphericalCurrent.radius = rad;
		this._sphericalTarget.radius = rad;

		// get the initail spherical coordinates from offset
		this._initialSpherical = this._cartesianToSpherical(
			this._offset[ 0 ],
			this._offset[ 1 ],
			this._offset[ 2 ] );

		this._mouseDown = false;

		this._sphericalCurrent.azimuth = this._sphericalTarget.azimuth = this._initialSpherical[ 0 ];
		this._sphericalCurrent.elevation = this._sphericalTarget.elevation = this._initialSpherical[ 1 ];

		this._mouseXOnDown = 0;
		this._mouseYOnDown = 0;

		this._azimuthStart = 0;
		this._elevationStart = 0;

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

		this._sphericalTarget.radius += ( direction * this._zoomSpeed );


	}

	private _handleMouseDown( ev: MouseEvent ) {

		this._mouseDown = true;

		this._mouseXOnDown = this._getMousePosition( ev ).x;
		this._mouseYOnDown = this._getMousePosition( ev ).y;

		if ( ! this._shiftKeyDown ) {

			this._azimuthStart = this._sphericalCurrent.azimuth;
			this._elevationStart = this._sphericalCurrent.elevation;

		} else {

			this._panStart = vec3.clone( this._target );

		}

	}

	private _handleMouseMove( ev: MouseEvent ) {

		if ( ! this._mouseDown ) return;

		if ( ! this._shiftKeyDown ) {

			const mouseX = this._getMousePosition( ev ).x;
			const mouseY = this._getMousePosition( ev ).y;

			const deltaX = ( mouseX - this._mouseXOnDown ) * this._rotateSpeed;
			const deltaY = ( mouseY - this._mouseYOnDown ) * this._rotateSpeed;

			this._sphericalTarget.azimuth = this._azimuthStart + deltaX;
			this._sphericalTarget.elevation = this._elevationStart - deltaY;

		} else {

			const mouseX = this._getMousePosition( ev ).x;
			const mouseY = this._getMousePosition( ev ).y;

			const deltaX = ( mouseX - this._mouseXOnDown ) * this._panSpeed;
			const deltaY = ( mouseY - this._mouseYOnDown ) * this._panSpeed;

			// apply left and right panning
			const tempVecA = vec3.clone( this._forward );
			vec3.cross( tempVecA, this._forward, this._up );
			const tempVecRight = vec3.clone( tempVecA );
			vec3.normalize( tempVecA, tempVecA );
			vec3.add( this._panTarget, this._panStart, vec3.scale( tempVecA, tempVecA, deltaX ) );

			// apply up and down panning
			const tempVecUp = vec3.create();
			vec3.cross( tempVecUp, tempVecRight, this._forward );
			vec3.normalize( tempVecUp, tempVecUp );
			vec3.sub( this._panTarget, this._panTarget, vec3.scale( tempVecUp, tempVecUp, deltaY ) );

		}

	}

	private _handleMouseUp() {

		this._mouseDown = false;

	}

	private _cartesianToSpherical( y: number, x: number, z: number ) {

		let elevation;
		let azimuth;

		if ( this._sphericalCurrent.radius === 0 ) {

			elevation = 0;
			azimuth = 0;

		} else {

			elevation = Math.atan2( x, z );
			azimuth = Math.acos( Math.min( Math.max( y / this._sphericalCurrent.radius, - 1 ), 1 ) );

		}

		return [ azimuth, elevation, this._sphericalCurrent.radius ];

	}

	private _spherialToCartesian() {

		const direction = vec3.create();

		const sineAzimuth = Math.sin( this._sphericalCurrent.azimuth );
		const cosineAzimuth = Math.cos( this._sphericalCurrent.azimuth );
		const sineElevation = Math.sin( this._sphericalCurrent.elevation );
		const cosineElevation = Math.cos( this._sphericalCurrent.elevation );

		direction[ 0 ] = this._sphericalCurrent.radius * cosineElevation * cosineAzimuth;
		direction[ 1 ] = this._sphericalCurrent.radius * sineElevation;
		direction[ 2 ] = this._sphericalCurrent.radius * cosineElevation * sineAzimuth;

		vec3.copy( this._forward, direction );

		return direction;

	}

	update() {

		// constraints
		this._sphericalTarget.elevation = Math.max( this._sphericalTarget.elevation, this._minElevation );
		this._sphericalTarget.elevation = Math.min( this._maxElevation, this._sphericalTarget.elevation );

		this._sphericalTarget.azimuth = Math.max( this._sphericalTarget.azimuth, this._minAzimuth );
		this._sphericalTarget.azimuth = Math.min( this._maxAzimuth, this._sphericalTarget.azimuth );

		this._sphericalTarget.radius = Math.max( this._sphericalTarget.radius, 0.001 );

		// lerp to target spherical position
		this._sphericalCurrent.azimuth += ( this._sphericalTarget.azimuth - this._sphericalCurrent.azimuth ) * this._ease;
		this._sphericalCurrent.elevation += ( this._sphericalTarget.elevation - this._sphericalCurrent.elevation ) * this._ease;
		this._sphericalCurrent.radius += ( this._sphericalTarget.radius - this._sphericalCurrent.radius ) * this._ease;

		// lerp to target pan position
		vec3.lerp( this._target, this._target, this._panTarget, this._ease );

		// map spherical coordinates to cartesian
		const newOffset = this._spherialToCartesian();

		// generate spherical coordinates for new position
		this._offset[ 0 ] = newOffset[ 0 ];
		this._offset[ 1 ] = newOffset[ 1 ];
		this._offset[ 2 ] = newOffset[ 2 ];

		// copy camera target to camera position
		this._node.transform.position = vec3.clone( this._target );

		// add the offset back to the camera position to ensure correct zoom path
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

	public get rotateSpeed(): number {

		return this._rotateSpeed;

	}

	public set rotateSpeed( value: number ) {

		this._rotateSpeed = value;

	}

	public get zoomSpeed(): number {

		return this._zoomSpeed;

	}

	public set zoomSpeed( value: number ) {

		this._zoomSpeed = value;

	}

	public get panSpeed(): number {

		return this._panSpeed;

	}

	public set panSpeed( value: number ) {

		this._panSpeed = value;

	}

	public get maxAzimuth(): number {

		return this._maxAzimuth;

	}

	public set maxAzimuth( value: number ) {

		this._maxAzimuth = value;

	}

	public get minAzimuth(): number {

		return this._minAzimuth;

	}

	public set minAzimuth( value: number ) {

		this._minAzimuth = value;

	}

	public get minElevation(): number {

		return this._minElevation;

	}

	public set minElevation( value: number ) {

		this._minElevation = value;

	}

	public get maxElevation(): number {

		return this._maxElevation;

	}

	public set maxElevation( value: number ) {

		this._maxElevation = value;

	}

}
