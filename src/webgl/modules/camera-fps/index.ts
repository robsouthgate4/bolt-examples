import { glMatrix, vec3 } from "gl-matrix";

import { Camera } from "@bolt-webgl/core";

export default class CameraFPS {

	private _activeKeys: string[];
	private _yaw: number;
	private _pitch: number;
	private _firstMouse: boolean;
	private _lastX: number;
	private _lastY: number;
	private _cameraSpeed!: number;
	private _camera: Camera;
	private _active: boolean;

	constructor( camera: Camera ) {

		this._camera = camera;
		this._active = false;

		this._activeKeys = [];

		this._yaw = - 90;
		this._pitch = 0;

		this._firstMouse = true;
		this._lastX = window.innerWidth / 2;
		this._lastY = window.innerHeight / 2;

		this.initListeners();

	}

	initListeners() {

		window.addEventListener( "mousemove", this.handleMouseMove.bind( this ) );

		window.addEventListener( "keyup", ( e ) => {

			const keys = [ "w", "s", "a", "d", "e", "q" ];
			if ( keys.includes( e.key ) ) {

				this._activeKeys = this._activeKeys.filter( ( k ) => k !== e.key );

			}

		} );

		window.addEventListener( "keydown", ( e ) => {

			this._activeKeys.push( e.key );

			if ( e.code === "Space" ) {

				this._active = ! this._active;

				if ( ! this._active ) {

					this._firstMouse = true;

					document.body.style.cursor = "pointer";

				} else {

					document.body.style.cursor = "none";

				}

			}

		} );

	}

	handleMouseMove( ev: MouseEvent ) {

		if ( ! this._active ) return;

		const xPos = ev.clientX;
		const yPos = ev.clientY;

		if ( this._firstMouse ) {

			this._lastX = xPos;
			this._lastY = yPos;
			this._firstMouse = false;

		}

		let xOffset = xPos - this._lastX;
		let yOffset = this._lastY - yPos;

		this._lastX = xPos;
		this._lastY = yPos;

		const sensitivity = 1;
		xOffset *= sensitivity;
		yOffset *= sensitivity;

		this._yaw += xOffset;
		this._pitch += yOffset;

		if ( this._pitch > 89.0 ) this._pitch = 89.0;
		if ( this._pitch < - 89.0 ) this._pitch = - 89.0;

		const yawRadian = glMatrix.toRadian( this._yaw );
		const pitchRadian = glMatrix.toRadian( this._pitch );
		const yawCos = Math.cos( yawRadian );
		const yawSin = Math.sin( yawRadian );
		const pitchCos = Math.cos( pitchRadian );
		const pitchSin = Math.sin( pitchRadian );

		const direction = vec3.create();
		direction[ 0 ] = yawCos * pitchCos;
		direction[ 1 ] = pitchSin;
		direction[ 2 ] = yawSin * pitchCos;

		vec3.normalize( direction, direction );
		vec3.copy( this._camera.forward, direction );

	}

	processInputs( delta: number ) {

		if ( ! this.active ) return;

		this._cameraSpeed = 20 * delta;

		if ( this._activeKeys.includes( "w" ) ) {

			const tempForward = vec3.clone( this._camera.forward );

			vec3.multiply(
				tempForward,
				tempForward,
				vec3.fromValues( this._cameraSpeed, this._cameraSpeed, this._cameraSpeed )
			);
			vec3.add( this._camera.position, this._camera.position, tempForward );

		}

		if ( this._activeKeys.includes( "s" ) ) {

			const tempForward = vec3.clone( this._camera.forward );

			vec3.multiply(
				tempForward,
				tempForward,
				vec3.fromValues( this._cameraSpeed, this._cameraSpeed, this._cameraSpeed )
			);
			vec3.sub( this._camera.position, this._camera.position, tempForward );

		}

		if ( this._activeKeys.includes( "a" ) ) {

			const tempPos = vec3.clone( this._camera.position );

			vec3.cross( tempPos, this._camera.forward, this._camera.up );
			vec3.normalize( tempPos, tempPos );

			vec3.multiply(
				tempPos,
				tempPos,
				vec3.fromValues( this._cameraSpeed, this._cameraSpeed, this._cameraSpeed )
			);

			vec3.sub( this._camera.position, this._camera.position, tempPos );

		}

		if ( this._activeKeys.includes( "d" ) ) {

			const tempPos = vec3.clone( this._camera.position );

			vec3.cross( tempPos, this._camera.forward, this._camera.up );
			vec3.normalize( tempPos, tempPos );

			vec3.multiply(
				tempPos,
				tempPos,
				vec3.fromValues( this._cameraSpeed, this._cameraSpeed, this._cameraSpeed )
			);
			vec3.add( this._camera.position, this._camera.position, tempPos );

		}

		if ( this._activeKeys.includes( "e" ) ) {

			vec3.add(
				this._camera.position,
				this._camera.position,
				vec3.fromValues( 0, this._cameraSpeed, 0 )
			);

		}

		if ( this._activeKeys.includes( "q" ) ) {

			vec3.add(
				this._camera.position,
				this._camera.position,
				vec3.fromValues( 0, - this._cameraSpeed, 0 )
			);

		}

	}

	update( delta?: number ) {

		if ( delta ) this.processInputs( delta );
		vec3.add( this._camera.target, this._camera.position, this._camera.forward );
		this._camera.transform.lookAt( this._camera.target, this._camera.up );

		this._camera.update();


	}

	public get active(): boolean {

		return this._active;

	}
	public set active( value: boolean ) {

		this._active = value;

	}

}
