

import Base from "@webgl/Base";
import Bolt, { Shader, Mesh, Transform, Batch, Node, TRIANGLES, CameraPersp, UNSIGNED_BYTE, UNSIGNED_SHORT } from "@bolt-webgl/core";

import colorVertex from "./shaders/color/color.vert";
import colorFragment from "./shaders/color/color.frag";

import { vec3, } from "gl-matrix";
import CameraArcball from "@webgl/modules/CameraArcball";
import { GeometryBuffers } from "@bolt-webgl/core/build/Mesh";
import Floor from "@/webgl/modules/batches/floor";

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
    arcball: CameraArcball;

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
    		position: vec3.fromValues( 0, 3, 12 ),
    		target: vec3.fromValues( 0, 1, 0 ),
    	} );

    	this.arcball = new CameraArcball( this.camera, 4, 0.08 );

    	this.bolt.setCamera( this.camera );
    	this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
    	this.bolt.enableDepth();

    	this.init();


    }

    async init() {

    	this.root = new Node();
    	this.root.name = "root";
    	this.root.transform.positionX = 0;

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

    	const triangleMesh = new Mesh( triangleGeo ).setDrawType( TRIANGLES );

    	const triShader = new Shader( colorVertex, colorFragment );

    	const colours = [
    		1, 1, 0,
    		0, 1, 1,
    		0, 0, 1,
    		1, 0, 0
    	];

    	const index = [
    		0, 1, 2, 3
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

    	this.bolt.disableCullFace();

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

    	this.arcball.update();

    	this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
    	this.bolt.clear( 1, 1, 1, 1 );

    	this.bolt.draw( this.root );

    }

    lateUpdate( elapsed: number, delta: number ) {

    	return;

    }

}
