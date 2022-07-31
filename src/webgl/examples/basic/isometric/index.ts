
import Base from "@webgl/Base";
import Bolt, { Shader, Mesh, Transform, Batch, Node, TRIANGLES, CameraOrtho } from "@bolt-webgl/core";

import normalVertex from "./shaders/normal/normal.vert";
import normalFragment from "./shaders/normal/normal.frag";

import { vec3, } from "gl-matrix";
import CameraArcball from "@webgl/modules/CameraArcball";
import Cube from "@/webgl/modules/primitives/Cube";
import Floor from "@/webgl/modules/batches/floor";

export default class extends Base {

    canvas: HTMLCanvasElement;
    shader: Shader;
    camera: CameraOrtho;
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
    frustumSize: number;

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

    	this.frustumSize = 7;
    	const aspect = this.canvas.width / this.canvas.height;

    	this.camera = new CameraOrtho( {
    		left: this.frustumSize * aspect / - 2,
    		right: this.frustumSize * aspect / 2,
    		bottom: - this.frustumSize / 2,
    		top: this.frustumSize / 2,
    		near: 0.1,
    		far: 1000,
    		position: vec3.fromValues( 2, 0.2, 1 ),
    		target: vec3.fromValues( 0, 0, 0 )
    	} );

    	this.arcball = new CameraArcball( this.camera, 4, 0.08 );

    	this.bolt.setCamera( this.camera );
    	this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
    	this.bolt.enableDepth();

    	this.init();


    }

    async init() {

    	const cubeGeometry = new Cube( { widthSegments: 1, heightSegments: 1 } );

    	this.cubeBatch = new Batch(
    		new Mesh( cubeGeometry ).setDrawType( TRIANGLES ),
    		this.shader
    	);

    	this.cubeBatch.name = "cube";
    	this.cubeBatch.transform.y = 0.75;

    	this.floorBatch = new Floor();
    	this.floorBatch.name = "floor";

    }

    resize() {

    	this.bolt.resizeFullScreen();

    	const aspect = this.canvas.width / this.canvas.height;

    	this.camera.left = this.frustumSize * aspect / - 2,
    	this.camera.right = this.frustumSize * aspect / 2,
    	this.camera.bottom = - this.frustumSize / 2,
    	this.camera.top = this.frustumSize / 2,

    	this.camera.updateProjection();

    }

    earlyUpdate( elapsed: number, delta: number ) {

    	return;

    }

    update( elapsed: number, delta: number ) {

    	this.camera.update();
    	this.arcball.update();

    	this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
    	this.bolt.clear( 1, 1, 1, 1 );

    	// applied to quaternion
    	this.cubeBatch.transform.rotateX = 0.5 * delta;
    	this.cubeBatch.transform.rotateY = 1 * delta;
    	this.cubeBatch.transform.rotateZ = - 1.5 * delta;

    	this.bolt.draw( this.cubeBatch );
    	this.bolt.draw( this.floorBatch );


    }

    lateUpdate( elapsed: number, delta: number ) {

    	return;

    }

}
