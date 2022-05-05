

/// @ts-nocheck
import Base from "@webgl/Base";
import Bolt, { Shader, Mesh, Transform, Batch, Node, TRIANGLES } from "@bolt-webgl/core";

import normalVertex from "./shaders/normal/normal.vert";
import normalFragment from "./shaders/normal/normal.frag";

import { vec3, } from "gl-matrix";
import CameraArcball from "@webgl/modules/CameraArcball";
import Sphere from "@webgl/modules/Primitives/Sphere";
import Cube from "@webgl/modules/Primitives/Cube";
import Floor from "@/webgl/modules/Batches/Floor";

export default class extends Base {

    canvas: HTMLCanvasElement;
    shader: Shader;
    camera: CameraArcball;
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

    	this.shader = new Shader( normalVertex, normalFragment );

    	this.camera = new CameraArcball(
    		this.width,
    		this.height,
    		vec3.fromValues( 0, 2, 10 ),
    		vec3.fromValues( 0, 0, 0 ),
    		45,
    		0.01,
    		1000,
    		0.08,
    		4,
    		0.5
    	);

    	this.bolt.setCamera( this.camera );
    	this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
    	this.bolt.enableDepth();

    	this.init();


    }

    async init() {

    	const sphereGeometry = new Sphere( { radius: 0.75, widthSegments: 32, heightSegments: 32 } );
    	const cubeGeometry = new Cube( { widthSegments: 1, heightSegments: 1 } );

    	this.root = new Node();
    	this.root.name = "root";
    	this.root.transform.x = 0;

    	this.sphereBatch = new Batch(
    		new Mesh( sphereGeometry ).setDrawType( TRIANGLES ),
    		this.shader
    	);
    	this.sphereBatch.transform.x = - 1.6;
    	this.sphereBatch.transform.scale = vec3.fromValues( 1.5, 1.5, 1.5 );
    	this.sphereBatch.name = "sphere";
    	this.sphereBatch.setParent( this.root );

    	this.cubeBatch = new Batch(
    		new Mesh( cubeGeometry ).setDrawType( TRIANGLES ),
    		this.shader
    	);

    	this.cubeBatch.name = "cube";
    	this.cubeBatch.transform.scale = vec3.fromValues( 1.5, 1.5, 1.5 );
    	this.cubeBatch.setParent( this.root );

    	this.floorBatch = new Floor();
    	this.floorBatch.name = "floor";
    	this.floorBatch.setParent( this.root );

    	this.cubeBatch.transform.x = 1.5;

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

    	this.bolt.draw( this.root );

    }

    lateUpdate( elapsed: number, delta: number ) {

    	return;

    }

}
