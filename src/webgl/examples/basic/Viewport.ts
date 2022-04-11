import Base from "@webgl/Base";
import Bolt, { Shader, Mesh, Transform, Batch, Node, Camera } from "@robsouthgate/bolt-core";

import defaultVertex from "../../examples/shaders/default/default.vert";
import defaultFragment from "../../examples/shaders/default/default.frag";

import { vec3 } from "gl-matrix";
import Plane from "../../modules/Primitives/Plane";

export default class extends Base {

    canvas: HTMLCanvasElement;
    shader: Shader;
    camera: Camera;
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

    constructor() {

    	super();

    	this.width = window.innerWidth;
    	this.height = window.innerHeight;

    	this.canvas = <HTMLCanvasElement>document.getElementById( "experience" );
    	this.canvas.width = this.width;
    	this.canvas.height = this.height;

    	this.bolt = Bolt.getInstance();
    	this.bolt.init( this.canvas, { antialias: true } );
    	this.gl = this.bolt.getContext();

    	this.shader = new Shader( defaultVertex, defaultFragment );

    	this.camera = new Camera(
    		this.width,
    		this.height,
    		vec3.fromValues( 0, 0, 5 ),
    		45,
    		0.01,
    		1000,
    	);

    	this.camera.lookAt( vec3.fromValues( 0, 0, 0 ) );

    	this.bolt.setCamera( this.camera );
    	this.bolt.enableDepth();
    	this.bolt.resizeFullScreen();

    	this.init();


    }

    async init() {

    	const planeGeometry = new Plane( { width: 1, height: 1 } );

    	this.root = new Node();

    	this.root.transform.scaleX = 0.5;

    	this.planeBatch = new Batch(
    		new Mesh( planeGeometry ),
    		this.shader
    	);

    	this.planeBatch.setParent( this.root );

    	this.resize();

    }

    resize() {

    	this.bolt.resizeFullScreen();

    	const fov = this.camera.fov * ( Math.PI / 180 );
    	const height = 2 * Math.tan( fov / 2 ) * ( this.camera.position[ 2 ] + 1.75 );
    	const width = height * this.camera.aspect;

    	this.viewport = {
    		height,
    		width,
    	};

    	this.planeBatch.transform.y = 0;
    	this.planeBatch.transform.x = 0;

    	this.planeBatch.transform.scaleX = this.viewport.width;
    	this.planeBatch.transform.scaleY = this.viewport.height;

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
