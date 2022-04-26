import Base from "@webgl/Base";
import Bolt, { Shader, Mesh, Transform, Batch, Node, TRIANGLES } from "@bolt-webgl/core";

import colorVertex from "./shaders/color/color.vert";
import colorFragment from "./shaders/color/color.frag";

import { vec3 } from "gl-matrix";
import CameraArcball from "../../../modules/CameraArcball";
import { GeometryBuffers } from "@bolt-webgl/core/lib/Mesh";
import Floor from "@/webgl/modules/Batches/Floor";
import Raycast from "@/webgl/modules/Raycast";

export default class extends Base {

    canvas: HTMLCanvasElement;
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
    raycast!: Raycast;

    constructor() {

    	super();

    	this.width = window.innerWidth;
    	this.height = window.innerHeight;

    	this.canvas = <HTMLCanvasElement>document.getElementById( "experience" );
    	this.canvas.width = this.width;
    	this.canvas.height = this.height;

    	this.bolt = Bolt.getInstance();
    	this.bolt.init( this.canvas, { antialias: true, dpi: 1 } );

    	this.gl = this.bolt.getContext();

    	this.camera = new CameraArcball(
    		this.width,
    		this.height,
    		vec3.fromValues( 0, 2, 6 ),
    		vec3.fromValues( 0, 1, 0 ),
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

    	this.root = new Node();

    	const triangleGeo: GeometryBuffers = {
    		positions: [
    			- 0.5, - 0.5, 0,
    			0.5, - 0.5, 0,
    			0.5, 0.5, 0,
    		],
    		normals: [
    			0, 0, 0,
    			0, 0, 0,
    			0, 0, 0
    		],
    		uvs: [
    			0, 0,
    			0, 0,
    			0, 0
    		],
    		indices: [ 0, 1, 2 ]
    	};

    	const triangleMesh = new Mesh( triangleGeo ).setDrawType( TRIANGLES );

    	const triShader = new Shader( colorVertex, colorFragment );

    	const colours = [
    		1, 1, 0,
    		0, 1, 1,
    		0, 0, 1
    	];

    	// attributes can be added with a layout id
    	triangleMesh.addAttribute( colours, 3, 4 );

    	this.triangleBatch = new Batch(
    		triangleMesh,
    		triShader
    	);

    	this.triangleBatch.setParent( this.root );
    	this.triangleBatch.transform.y = 1;
    	this.triangleBatch.transform.scale = vec3.fromValues( 1.5, 1.5, 1.5 );

    	this.floorBatch = new Floor();
    	this.floorBatch.setParent( this.root );

    	this.raycast = new Raycast( this.camera );

    	this.resize();

    	window.addEventListener( "click", ( ev ) => {

    	} );

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


    	this.root.traverse( ( node: Node ) => {

    		this.bolt.draw( node );

    	} );

    }

    lateUpdate( elapsed: number, delta: number ) {

    	return;

    }

}
