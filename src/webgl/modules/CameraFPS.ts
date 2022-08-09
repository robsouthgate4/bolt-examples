import { glMatrix, mat4, vec3 } from "gl-matrix";
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

    constructor(
    	camera: Camera ) {

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

    	window.addEventListener( "keyup", e => {

    		if ( e.key === "w" ) {

    			this._activeKeys = this._activeKeys.filter( ( e ) => e !== 'w' );

    		}

    		if ( e.key === "s" ) {

    			this._activeKeys = this._activeKeys.filter( ( e ) => e !== 's' );


    		}

    		if ( e.key === "a" ) {

    			this._activeKeys = this._activeKeys.filter( ( e ) => e !== 'a' );


    		}

    		if ( e.key === "d" ) {

    			this._activeKeys = this._activeKeys.filter( ( e ) => e !== 'd' );

    		}

    		if ( e.key === "e" ) {

    			this._activeKeys = this._activeKeys.filter( ( e ) => e !== 'e' );

    		}

    		if ( e.key === "q" ) {

    			this._activeKeys = this._activeKeys.filter( ( e ) => e !== 'q' );

    		}

    	} );

    	window.addEventListener( "keydown", e => {

    		if ( e.key === "w" ) {

    			this._activeKeys.push( "w" );

    		}

    		if ( e.key === "s" ) {

    			this._activeKeys.push( "s" );

    		}

    		if ( e.key === "a" ) {

    			this._activeKeys.push( "a" );

    		}

    		if ( e.key === "d" ) {

    			this._activeKeys.push( "d" );

    		}

    		if ( e.key === "e" ) {

    			this._activeKeys.push( "e" );

    		}

    		if ( e.key === "q" ) {

    			this._activeKeys.push( "q" );

    		}

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

    	if ( this._pitch > 89.0 )
    		this._pitch = 89.0;
    	if ( this._pitch < - 89.0 )
    		this._pitch = - 89.0;

    	const direction = vec3.create();
    	direction[ 0 ] = Math.cos( glMatrix.toRadian( this._yaw ) ) * Math.cos( glMatrix.toRadian( this._pitch ) );
    	direction[ 1 ] = Math.sin( glMatrix.toRadian( this._pitch ) );
    	direction[ 2 ] = Math.sin( glMatrix.toRadian( this._yaw ) ) * Math.cos( glMatrix.toRadian( this._pitch ) );

    	vec3.normalize( direction, direction );
    	vec3.copy( this._camera.forward, direction );


    }

    processInputs( delta: number ) {

    	if ( ! this.active ) return;

    	this._cameraSpeed = 20 * delta;

    	if ( this._activeKeys.includes( "w" ) ) {

    		const tempForward = vec3.clone( this._camera.forward );

    		vec3.multiply( tempForward, tempForward, vec3.fromValues( this._cameraSpeed, this._cameraSpeed, this._cameraSpeed ) );
    		vec3.add( this._camera.position, this._camera.position, tempForward );

    	}

    	if ( this._activeKeys.includes( "s" ) ) {

    		const tempForward = vec3.clone( this._camera.forward );

    		vec3.multiply( tempForward, tempForward, vec3.fromValues( this._cameraSpeed, this._cameraSpeed, this._cameraSpeed ) );
    		vec3.sub( this._camera.position, this._camera.position, tempForward );

    	}

    	if ( this._activeKeys.includes( "a" ) ) {

    		const tempPos = vec3.clone( this._camera.position );

    		vec3.cross( tempPos, this._camera.forward, this._camera.up );
    		vec3.normalize( tempPos, tempPos );

    		vec3.multiply( tempPos, tempPos, vec3.fromValues( this._cameraSpeed, this._cameraSpeed, this._cameraSpeed ) );
    		vec3.sub( this._camera.position, this._camera.position, tempPos );

    	}

    	if ( this._activeKeys.includes( "d" ) ) {

    		const tempPos = vec3.clone( this._camera.position );

    		vec3.cross( tempPos, this._camera.forward, this._camera.up );
    		vec3.normalize( tempPos, tempPos );

    		vec3.multiply( tempPos, tempPos, vec3.fromValues( this._cameraSpeed, this._cameraSpeed, this._cameraSpeed ) );
    		vec3.add( this._camera.position, this._camera.position, tempPos );

    	}

    	if ( this._activeKeys.includes( "e" ) ) {

    		vec3.add( this._camera.position, this._camera.position, vec3.fromValues( 0, this._cameraSpeed, 0 ) );

    	}

    	if ( this._activeKeys.includes( "q" ) ) {

    		vec3.add( this._camera.position, this._camera.position, vec3.fromValues( 0, - this._cameraSpeed, 0 ) );

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
