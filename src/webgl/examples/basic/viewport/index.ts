
import Base from "@webgl/Base";
import Bolt, { Shader, Mesh, Transform, Batch, Node, TRIANGLES, CameraPersp } from "@bolt-webgl/core";

import defaultVertex from "./shaders/default/default.vert";
import defaultFragment from "./shaders/default/default.frag";

import { vec3 } from "gl-matrix";
import Plane from "@webgl/modules/Primitives/Plane";
import CameraArcball from "@/webgl/modules/CameraArcball";

export default class extends Base {

    canvas: HTMLCanvasElement;
    shader: Shader;
    camera: CameraPersp;
    arcball: CameraArcball;
    assetsLoaded?: boolean;
    torusTransform!: Transform;
    sphereBatch!: Batch;
    cubeBatch!: Batch;
    planeBatch!: Batch;
    triangleBatch!: Batch;
    bolt: Bolt;
    root!: Node;
    viewport!: { height: number; width: number; };
    gl: WebGL2RenderingContext;
    batches: Batch[] = [];

    constructor() {

    	super();

    	this.width = window.innerWidth;
    	this.height = window.innerHeight;

    	this.canvas = <HTMLCanvasElement>document.getElementById( "experience" );
    	this.canvas.width = this.width;
    	this.canvas.height = this.height;

    	this.bolt = Bolt.getInstance();
    	this.bolt.init( this.canvas, { antialias: true, dpi: 2 } );
    	this.gl = this.bolt.getContext();

    	this.shader = new Shader( defaultVertex, defaultFragment );

    	this.camera = new CameraPersp( {
    		aspect: this.canvas.width / this.canvas.height,
    		fov: 45,
    		near: 0.1,
    		far: 1000,
    		position: vec3.fromValues( 0, 3, 10 ),
    		target: vec3.fromValues( 0, 1, 0 ),
    	} );

    	this.arcball = new CameraArcball( this.camera, 4, 0.08 );

    	this.camera.lookAt( vec3.fromValues( 0, 0, 0 ) );

    	this.bolt.setCamera( this.camera );
    	this.bolt.enableDepth();

    	this.init();

    	this.resize();

    }

    generateViewport() {

    	const fov = this.camera.fov;
    	const height = 2 * Math.tan( fov / 2 ) * ( this.camera.position[ 2 ] );
    	const width = height * this.camera.aspect;

    	return {
    		height,
    		width,
    	};

    }

    async init() {

    	const vp = this.generateViewport();

    	const planeGeometry = new Plane( { width: 1, height: 1 } );

    	this.root = new Node();

    	const mesh = new Mesh( planeGeometry ).setDrawType( TRIANGLES );

    	this.planeBatch = new Batch(
    		mesh,
    		this.shader
    	);

    	const count = 5;

    	for ( let index = 0; index < count; index ++ ) {

    		const batch = new Batch(
    			mesh,
    			this.shader
    		);

    		batch.transform.x = ( index * 2.5 ) - count;

    		batch.transform.scaleX = vp.width / 8;
    	    batch.transform.scaleY = vp.height / 8;

    		this.batches.push( batch );

    		batch.setParent( this.root );

    	}

    	this.resize();

    }

    resize() {

    	this.bolt.resizeFullScreen();
    	this.camera.updateProjection( this.canvas.width / this.canvas.height );

    	const vp = this.generateViewport();

    	// now resize all batches

    }

    earlyUpdate( elapsed: number, delta: number ) {

    	return;

    }

    update( elapsed: number, delta: number ) {

    	this.camera.update();

    	this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
    	this.bolt.clear( 0, 0, 0, 1 );

    	this.bolt.draw( this.root );

    }

    lateUpdate( elapsed: number, delta: number ) {

    	return;

    }

}
