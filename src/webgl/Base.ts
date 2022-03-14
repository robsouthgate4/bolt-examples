


import Stats from "stats.js";

import { glSettings } from "@webgl/globals/constants";

const { DEBUG_FPS, USE_ORBIT_CONTROLS, DEBUG_DRAW_COUNT } = glSettings;

export default class Base {

    isRunning = false;
    requestFrame?: number;
    elapsed = 0;
    stats?: Stats;
    drawCallCount?: number;
    now: number;
    width: number;
    height: number;
    delta: number;
    currentTime: number;
    lastTime: number;

    constructor() {

    	this.now = Date.now();

    	this.delta = 0;
    	this.lastTime = ( new Date() ).getTime(),
    	this.currentTime = 0,
    	this.delta = 0;

    	this.width = window.innerWidth;
    	this.height = window.innerHeight;

    	if ( DEBUG_FPS ) {

    		this.stats = new Stats();
    		this.stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
    		document.body.appendChild( this.stats.dom );

    	}

    	document.addEventListener( "visibilitychange", () => {

    		document.visibilityState === "visible" ? this.start() : this.pause();

    	} );

    }

    start() {

    	this.isRunning = true;
    	this.run( 0 );

    }

    destroy() {

    	if ( this.requestFrame ) {

    		cancelAnimationFrame( this.requestFrame );
    		this.requestFrame = undefined;

    	}

    }


    pause() {

    	if ( this.requestFrame ) {

    		cancelAnimationFrame( this.requestFrame );
    		this.requestFrame = undefined;

    	}

    	this.isRunning = false;

    }

    earlyUpdate( elapsed: number, delta: number ) {
    }

    update( elapsed: number, delta: number ) {
    }

    lateUpdate( elapsed: number, delta: number ) {
    }

    run( timestamp: number ) {


    	const { DEBUG_FPS } = glSettings;

    	this.elapsed = timestamp * 0.001;
    	this.delta = this.elapsed - this.lastTime;
    	this.lastTime = this.elapsed;


    	this.earlyUpdate( this.elapsed, this.delta );
    	this.update( this.elapsed, this.delta );
    	this.lateUpdate( this.elapsed, this.delta );

    	if ( DEBUG_FPS ) this.stats?.end();

    	if ( this.isRunning ) {

    		this.requestFrame = requestAnimationFrame( this.run.bind( this ) );

    	}

    }

}
