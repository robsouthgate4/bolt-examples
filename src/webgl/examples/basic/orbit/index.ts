

import Base from "@webgl/Base";
import Bolt, { Shader, Mesh, Transform, Batch, Node, CameraPersp } from "@bolt-webgl/core";

import colorVertex from "./shaders/color/color.vert";
import colorFragment from "./shaders/color/color.frag";

import normalVertex from "./shaders/normal/normal.vert";
import normalFragment from "./shaders/normal/normal.frag";


import { vec3, } from "gl-matrix";
import Orbit from "@webgl/modules/Orbit";
import { GeometryBuffers } from "@bolt-webgl/core/build/Mesh";
import Floor from "@/webgl/modules/batches/floor";
import Cube from "@/webgl/modules/primitives/Cube";

export default class extends Base {

    canvas: HTMLCanvasElement;
    camera: CameraPersp;
    assetsLoaded?: boolean;
    torusTransform!: Transform;
    sphereBatch!: Batch;
    cubeBatch!: Batch;
    planeBatch!: Batch;
    triangleBatch!: Batch;
    bolt: Bolt;
    gl: WebGL2RenderingContext;
    root!: Node;
    floorBatch: any;
    orbit!: Orbit;

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

    	this.camera = new CameraPersp( {
    		aspect: this.canvas.width / this.canvas.height,
    		fov: 45,
    		near: 0.1,
    		far: 1000,
    		position: vec3.fromValues( 20, 1, 10 ),
    		target: vec3.fromValues( 0, 1, 0 ),
    	} );

    	this.bolt.setCamera( this.camera );
    	this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
    	this.bolt.enableDepth();

    	this.init();


    }

    async init() {

    	this.root = new Node();
    	this.root.name = "root";

    	this.floorBatch = new Floor();
    	this.floorBatch.name = "floor";
    	this.floorBatch.setParent( this.root );

    	// draw a simple quad
    	const triangleGeo: GeometryBuffers = {
    		positions: [
    			- 0.5, 0.5, 0.0,
    			- 0.5, - 0.5, 0.0,
    			0.5, - 0.5, 0.0,
    			0.5, 0.5, 0.0
    		],
    		indices: [ 0, 1, 2, 0, 2, 3 ]
    	};



    	const cubeMesh = new Mesh( new Cube() );
    	const cubeShader = new Shader( normalVertex, normalFragment );
    	const cubeBatch = new Batch( cubeMesh, cubeShader );

    	cubeBatch.transform.position = vec3.fromValues( 0, 3, 6 );
    	cubeBatch.transform.lookAt( vec3.fromValues( 0, 1.5, 0 ) );

    	this.orbit = new Orbit( cubeBatch );

    	cubeBatch.setParent( this.root );

    	const triangleMesh = new Mesh( triangleGeo );
    	const triShader = new Shader( colorVertex, colorFragment );

    	const colours = [
    		1, 1, 0,
    		0, 1, 1,
    		0, 0, 1,
    		1, 0, 0
    	];

    	// attributes can be added with a named var and shader
    	triangleMesh.addAttribute( new Float32Array( colours ), 3, { shader: triShader, attributeName: "aColor" } );

    	this.triangleBatch = new Batch(
    		triangleMesh,
    		triShader
    	);

    	this.triangleBatch.transform.positionY = 1.5;
    	this.triangleBatch.transform.scale = vec3.fromValues( 3, 3, 3 );

    	this.triangleBatch.setParent( this.root );

    	this.resize();

    }

    resize() {

    	this.bolt.resizeFullScreen();
    	this.camera.updateProjection( this.canvas.width / this.canvas.height );

    }

    earlyUpdate( elapsed: number, delta: number ) {

    	return;

    }

    update( elapsed: number, delta: number ) {

    	this.camera.update();

    	this.orbit.update();

    	this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
    	this.bolt.clear( 1, 1, 1, 1 );

    	this.bolt.draw( this.root );

    }

    lateUpdate( elapsed: number, delta: number ) {

    	return;

    }

}
