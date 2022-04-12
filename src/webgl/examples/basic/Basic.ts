import Base from "@webgl/Base";
import defaultVertex from "../../examples/shaders/default/default.vert";
import defaultFragment from "../../examples/shaders/default/default.frag";

import Bolt, { Shader, Transform, Node, Mesh } from "@bolt-webgl/core";

import { vec3, } from "gl-matrix";
import CameraArcball from "../../modules/CameraArcball";
import GLTFParser from "../../modules/GLTFParser";
import Batch from "@bolt-webgl/core/lib/Batch";

export default class extends Base {

    canvas: HTMLCanvasElement;
    shader: Shader;
    lightPosition: vec3;
    camera: CameraArcball;
    assetsLoaded!: boolean;
    torusTransform!: Transform;
    torusBatch!: Batch;
    bolt: Bolt;
    root!: Node;

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
    		vec3.fromValues( 0, 3, 3 ),
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


    	const gltfLoader = new GLTFParser( "/static/models/gltf/torus.gltf" );
    	const geometry = await gltfLoader.loadGLTF();

    	if ( ! geometry ) return;

    	this.assetsLoaded = true;

    	// set shader uniforms
    	this.shader.activate();
    	this.shader.setVector3( "objectColor", vec3.fromValues( 1.0, 0.0, 0.0 ) );
    	this.shader.setVector3( "lightColor", vec3.fromValues( 0.95, 1.0, 1.0 ) );

    	// setup nodes
    	this.torusBatch = new Batch(
    		new Mesh( geometry ),
    		this.shader
    	);

    	this.torusBatch.transform.position = vec3.fromValues( 0, 0, 0 );
    	this.torusBatch.transform.scale = vec3.fromValues( 1, 1, 1 );

    	this.resize();

    }

    resize() {

    	this.bolt.resizeFullScreen();

    }

    earlyUpdate( elapsed: number, delta: number ) {

    	return;

    }

    update( elapsed: number, delta: number ) {

    	if ( ! this.assetsLoaded ) return;

    	this.camera.update();

    	this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
    	this.bolt.clear( 1, 1, 1, 1 );

    	this.shader.activate();
    	this.shader.setVector3( "viewPosition", this.camera.position );
    	this.shader.setFloat( "time", elapsed );

    	this.torusBatch.transform.rotateX = 2 * delta;
    	this.torusBatch.transform.rotateY = 1 * delta;
    	this.torusBatch.transform.rotateZ = 3 * delta;

    	this.bolt.draw( this.torusBatch );

    }

    lateUpdate( elapsed: number, delta: number ) {

    	return;

    }

}
