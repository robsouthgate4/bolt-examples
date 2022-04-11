import Base from "@webgl/Base";
import Bolt, { Shader, Mesh, Transform, Batch, Node, TRIANGLES, POINTS, LINE_LOOP, LINES } from "@robsouthgate/bolt-core";

import defaultVertex from "../../examples/shaders/default/default.vert";
import defaultFragment from "../../examples/shaders/default/default.frag";

import colorVertex from "../../examples/shaders/color/color.vert";
import colorFragment from "../../examples/shaders/color/color.frag";

import { vec3, } from "gl-matrix";
import CameraArcball from "../../modules/CameraArcball";
import Sphere from "../../modules/Primitives/Sphere";
import Cube from "../../modules/Primitives/Cube";
import Plane from "../../modules/Primitives/Plane";
import { GeometryBuffers } from "@robsouthgate/bolt-core/lib/Mesh";
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

    	this.bolt.setCamera( this.camera );
    	this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
    	this.bolt.enableDepth();

    	this.init();


    }

    async init() {

    	const sphereGeometry = new Sphere( { radius: 1, widthSegments: 32, heightSegments: 32 } );
    	const cubeGeometry = new Cube( { widthSegments: 1, heightSegments: 1 } );
    	const planeGeometry = new Plane( { widthSegments: 10, heightSegments: 10 } );

    	this.root = new Node();

    	const triangleGeo: GeometryBuffers = {
    		positions: [
    			- 0.5, - 0.5, 0,
    			0.5, - 0.5, 0,
    			0.5, 0.5, 0,
    		],
    		indices: [ 0, 1, 2 ],
    		normals: [
    			0, 0, - 1,
    			0, 0, - 1,
    			0, 0, - 1
    		]
    	};

    	const triangleMesh = new Mesh( triangleGeo ).setDrawType( TRIANGLES );

    	const triShader = new Shader( colorVertex, colorFragment );

    	this.triangleBatch = new Batch(
    		triangleMesh,
    		triShader
    	);

    	this.triangleBatch.setParent( this.root );
    	this.triangleBatch.transform.y = 2.5;
    	this.triangleBatch.transform.scale = vec3.fromValues( 1, 1, 1 );

    	this.sphereBatch = new Batch(
    		new Mesh( sphereGeometry ).setDrawType( TRIANGLES ),
    		this.shader
    	);

    	this.sphereBatch.setParent( this.root );

    	this.cubeBatch = new Batch(
    		new Mesh( cubeGeometry ).setDrawType( TRIANGLES ),
    		this.shader
    	);

    	this.cubeBatch.setParent( this.root );


    	this.planeBatch = new Batch(
    		new Mesh( planeGeometry ).setDrawType( TRIANGLES ),
    		this.shader
    	);

    	this.planeBatch.setParent( this.root );

    	this.planeBatch.transform.x = - 2;
    	this.cubeBatch.transform.x = 2;

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

    	this.root.transform.rotationY += 0.01;

    	this.root.traverse( ( node: Node ) => {

    		this.bolt.draw( node );

    	} );

    }

    lateUpdate( elapsed: number, delta: number ) {

    	return;

    }

}
