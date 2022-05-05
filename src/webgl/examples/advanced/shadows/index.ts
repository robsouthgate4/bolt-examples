


/// @ts-nocheck
import Base from "@webgl/Base";
import Bolt, { Shader, Mesh, Transform, Batch, FBO } from "@bolt-webgl/core";

import defaultVertex from "./shaders/default/default.vert";
import defaultFragment from "./shaders/default/default.frag";

import { mat4, vec3, } from "gl-matrix";
import CameraArcball from "@webgl/modules/CameraArcball";
import Cube from "@webgl/modules/Primitives/Cube";
import Plane from "@webgl/modules/Primitives/Plane";

// WIP

export default class extends Base {

    canvas: HTMLCanvasElement;
    shader: Shader;
    lightPosition: vec3;
    camera: CameraArcball;
    assetsLoaded?: boolean;
    torusTransform!: Transform;
    cubeBatch!: Batch;
    planeBatch!: Batch;
    bolt: Bolt;
    shadowMapSize!: number;
    depthFBO!: FBO;
    lightProjection: mat4;
    lightView: mat4;
    lightSpaceMatrix: mat4;

    constructor() {

    	super();

    	this.width = window.innerWidth;
    	this.height = window.innerHeight;

    	this.canvas = <HTMLCanvasElement>document.getElementById( "experience" );
    	this.canvas.width = this.width;
    	this.canvas.height = this.height;

    	this.bolt = Bolt.getInstance();
    	this.bolt.init( this.canvas, { antialias: true } );

    	this.shader = new Shader( defaultVertex, defaultFragment );
    	this.lightPosition = vec3.fromValues( 0, 10, 0 );

    	this.camera = new CameraArcball(
    		this.width,
    		this.height,
    		vec3.fromValues( 0, 3, 6 ),
    		vec3.fromValues( 0, 0, 0 ),
    		45,
    		0.01,
    		1000,
    		0.2,
    		2
    	);

    	this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
    	this.bolt.setCamera( this.camera );
    	this.bolt.enableDepth();

    	// shadow mapping

    	const nearPlane = 1;
    	const farPlane = 7.5;

    	this.lightProjection = mat4.create();
    	mat4.ortho( this.lightProjection, - 10, 10, - 10, 10, nearPlane, farPlane );

    	this.lightView = mat4.create();
    	mat4.lookAt( this.lightView, vec3.fromValues( - 2, 4, - 1 ), vec3.fromValues( 0, 0, 0 ), vec3.fromValues( 0, 1, 0 ) );

    	this.lightSpaceMatrix = mat4.create();
    	mat4.multiply( this.lightSpaceMatrix, this.lightProjection, this.lightView );

    	this.shadowMapSize = 1024;
    	this.depthFBO = new FBO( { width: this.shadowMapSize, height: this.shadowMapSize, depth: true } );

    	this.init();


    }

    async init() {

    	const cubeGeometry = new Cube( { widthSegments: 1, heightSegments: 1 } );
    	const planeGeometry = new Plane( { widthSegments: 10, heightSegments: 10 } );

    	this.cubeBatch = new Batch(
    		new Mesh( cubeGeometry ),
    		this.shader
    	);

    	this.cubeBatch.transform.position[ 1 ] = 0.5;
    	this.cubeBatch.transform.rotateY = Math.PI * 0.5;

    	this.planeBatch = new Batch(
    		new Mesh( planeGeometry ),
    		this.shader
    	);

    	this.planeBatch.transform.rotateX = Math.PI * 0.5;
    	this.planeBatch.transform.scale = vec3.fromValues( 10, 10, 10 );

    	this.resize();

    }

    resize() {

    	this.bolt.resizeFullScreen();

    }

    earlyUpdate( elapsed: number, delta: number ) {

    	return;

    }

    update( elapsed: number, delta: number ) {



    	this.camera.update();

    	this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
    	this.bolt.clear( 1, 1, 1, 1 );

    	this.bolt.draw( [ this.planeBatch, this.cubeBatch ] );


    }

    lateUpdate( elapsed: number, delta: number ) {

    	return;

    }

}
