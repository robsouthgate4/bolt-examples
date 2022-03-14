import { glMatrix, mat4, vec3 } from "gl-matrix";
import Camera from "../core/Camera";

export default class CameraFPS extends Camera {

    keyPressed: string;
    activeKeys: string[];
    yaw: number;
    pitch: number;
    delta: number;
    lastFrame: number;
    firstMouse: boolean;
    mouseDown: boolean;
    lastX: number;
    lastY: number;
    newPosition: vec3;
    cameraSpeed!: number;

    constructor(
    	width: number,
    	height: number,
    	position: vec3,
    	fov: number,
    	near: number,
    	far: number ) {

    	super(
    		width,
    		height,
    		position,
    		fov,
    		near,
    		far
    	);

    	this.keyPressed = "";
    	this.activeKeys = [];
    	this.active = false;

    	this.yaw = - 90;
    	this.pitch = 0;

    	this.delta = 0;
    	this.lastFrame = 0;
    	this.firstMouse = true;
    	this.mouseDown = false;
    	this.lastX = window.innerWidth / 2;
    	this.lastY = window.innerHeight / 2;

    	this.newPosition = vec3.create();

    	vec3.copy( this.newPosition, this.position );

    	this.resize( window.innerWidth, window.innerHeight );

    	this.initListeners();

    }

    initListeners() {

    	window.addEventListener( "mousemove", this.handleMouseMove.bind( this ) );

    	window.addEventListener( "keyup", e => {

    		if ( e.key === "w" ) {

    			this.activeKeys = this.activeKeys.filter( ( e ) => e !== 'w' );

    		}

    		if ( e.key === "s" ) {

    			this.activeKeys = this.activeKeys.filter( ( e ) => e !== 's' );


    		}

    		if ( e.key === "a" ) {

    			this.activeKeys = this.activeKeys.filter( ( e ) => e !== 'a' );


    		}

    		if ( e.key === "d" ) {

    			this.activeKeys = this.activeKeys.filter( ( e ) => e !== 'd' );

    		}

    		if ( e.key === "e" ) {

    			this.activeKeys = this.activeKeys.filter( ( e ) => e !== 'e' );

    		}

    		if ( e.key === "q" ) {

    			this.activeKeys = this.activeKeys.filter( ( e ) => e !== 'q' );

    		}

    	} );

    	window.addEventListener( "keydown", e => {

    		if ( e.key === "w" ) {

    			this.activeKeys.push( "w" );

    		}

    		if ( e.key === "s" ) {

    			this.activeKeys.push( "s" );

    		}

    		if ( e.key === "a" ) {

    			this.activeKeys.push( "a" );

    		}

    		if ( e.key === "d" ) {

    			this.activeKeys.push( "d" );

    		}

    		if ( e.key === "e" ) {

    			this.activeKeys.push( "e" );

    		}

    		if ( e.key === "q" ) {

    			this.activeKeys.push( "q" );

    		}

    		if ( e.code === "Space" ) {

    			this.active = ! this.active;

    			if ( ! this.active ) {

    				this.firstMouse = true;

    				document.body.style.cursor = "pointer";

    			} else {

    				document.body.style.cursor = "none";

    			}

    		}

    	} );

    }

    handleMouseMove( ev: MouseEvent ) {

    	if ( ! this.active ) return;

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

    	const sensitivity = 0.4;
    	xOffset *= sensitivity;
    	yOffset *= sensitivity;

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

    resize( width: number, height: number ) {

    	mat4.perspective( this.projection, this.fov, width / height, this.near, this.far );

    }

    processInputs( delta: number ) {

    	if ( ! this.active ) return;

    	this.cameraSpeed = 10 * delta;

    	if ( this.activeKeys.includes( "w" ) ) {

    		const tempForward = vec3.clone( this.forward );

    		vec3.multiply( tempForward, tempForward, vec3.fromValues( this.cameraSpeed, this.cameraSpeed, this.cameraSpeed ) );
    		vec3.add( this.position, this.position, tempForward );

    	}

    	if ( this.activeKeys.includes( "s" ) ) {

    		const tempForward = vec3.clone( this.forward );

    		vec3.multiply( tempForward, tempForward, vec3.fromValues( this.cameraSpeed, this.cameraSpeed, this.cameraSpeed ) );
    		vec3.sub( this.position, this.position, tempForward );

    	}

    	if ( this.activeKeys.includes( "a" ) ) {

    		const tempPos = vec3.clone( this.position );

    		vec3.cross( tempPos, this.forward, this.up );
    		vec3.normalize( tempPos, tempPos );

    		vec3.multiply( tempPos, tempPos, vec3.fromValues( this.cameraSpeed, this.cameraSpeed, this.cameraSpeed ) );
    		vec3.sub( this.position, this.position, tempPos );

    	}

    	if ( this.activeKeys.includes( "d" ) ) {

    		const tempPos = vec3.clone( this.position );

    		vec3.cross( tempPos, this.forward, this.up );
    		vec3.normalize( tempPos, tempPos );

    		vec3.multiply( tempPos, tempPos, vec3.fromValues( this.cameraSpeed, this.cameraSpeed, this.cameraSpeed ) );
    		vec3.add( this.position, this.position, tempPos );

    	}

    	if ( this.activeKeys.includes( "e" ) ) {

    		vec3.add( this.position, this.position, vec3.fromValues( 0, this.cameraSpeed, 0 ) );

    	}

    	if ( this.activeKeys.includes( "q" ) ) {

    		vec3.add( this.position, this.position, vec3.fromValues( 0, - this.cameraSpeed, 0 ) );

    	}


    }

    update( delta?: number ) {

    	if ( delta ) this.processInputs( delta );

    	vec3.add( this.target, this.position, this.forward );
    	mat4.lookAt( this.view, this.position, this.target, this.up );
    	mat4.multiply( this.camera, this.projection, this.view );

    }

}
