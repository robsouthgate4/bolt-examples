import Base from "@webgl/Base";
import Bolt, { Shader, Node, Mesh, Transform } from "@robsouthgate/bolt-core";

import defaultVertex from "../../examples/shaders/default/default.vert";
import defaultFragment from "../../examples/shaders/default/default.frag";

import { vec3, } from "gl-matrix";
import CameraArcball from "../../modules/CameraArcball";
import Sphere from "../../modules/Primitives/Sphere";
import Cube from "../../modules/Primitives/Cube";
import Plane from "../../modules/Primitives/Plane";

export default class extends Base {

    canvas: HTMLCanvasElement;
    shader: Shader;
    lightPosition: vec3;
    camera: CameraArcball;
    assetsLoaded?: boolean;
    torusTransform!: Transform;
    sphereNode!: Node;
    cubeNode!: Node;
    planeNode!: Node;
    bolt: Bolt;

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
    		vec3.fromValues( 0, 2, 6 ),
    		vec3.fromValues( 0, 0, 0 ),
    		45,
    		0.01,
    		1000,
    		0.2,
    		2
    	);

    	this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
    	this.bolt.enableDepth();

    	this.init();


    }

    async init() {

    	const sphereGeometry = new Sphere( { radius: 1, widthSegments: 32, heightSegments: 32 } );
    	const cubeGeometry = new Cube( { widthSegments: 1, heightSegments: 1 } );
    	const planeGeometry = new Plane( { widthSegments: 10, heightSegments: 10 } );

    	this.sphereNode = new Node(
    		new Mesh( sphereGeometry ),
    	);

    	this.cubeNode = new Node(
    		new Mesh( cubeGeometry ),
    	);

    	this.cubeNode.autoUpdate = false;
    	this.cubeNode.transform.position[ 0 ] = 1.5;
    	this.cubeNode.updateModelMatrix();

    	this.planeNode = new Node(
    		new Mesh( planeGeometry ),
    	);

    	this.planeNode.transform.position[ 0 ] = - 1.5;

    	this.resize();

    }

    resize() {

    	this.bolt.resizeFullScreen();

    }

    earlyUpdate( elapsed: number, delta: number ) {

    	super.earlyUpdate( elapsed, delta );

    }

    update( elapsed: number, delta: number ) {

    	super.update( elapsed, delta );

    	this.camera.update();

    	this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
    	this.bolt.clear( 1, 1, 1, 1 );

    	this.shader.activate();
    	this.shader.setVector3( "viewPosition", this.camera.position );
    	this.shader.setFloat( "time", elapsed );

    	this.cubeNode.transform.rotation[ 1 ] += 0.01;
    	this.cubeNode.updateModelMatrix();

    	this.sphereNode.transform.rotation[ 1 ] = this.planeNode.transform.rotation[ 1 ] += 0.01;

    	this.sphereNode.drawTriangles( this.shader, this.camera );
    	this.cubeNode.drawTriangles( this.shader, this.camera );
    	this.planeNode.drawTriangles( this.shader, this.camera );


    }

    lateUpdate( elapsed: number, delta: number ) {

    	super.lateUpdate( elapsed, delta );

    }

}
