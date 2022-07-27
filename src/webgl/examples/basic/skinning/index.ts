
import Base from "@webgl/Base";
import Bolt, { BACK, CameraPersp, FRONT, Node, } from "@bolt-webgl/core";

import { quat, vec3 } from "gl-matrix";
import CameraArcball from "@/webgl/modules/CameraArcball";
import Floor from "@/webgl/modules/batches/floor";
import GLTFLoader from "@/webgl/modules/gltf-loader";

export default class extends Base {

    canvas: HTMLCanvasElement;
    lightPosition: vec3;
    camera: CameraPersp;
    assetsLoaded?: boolean;
    sphereNode!: Node;
    planeNode!: Node;
    bolt: Bolt;
    gltf!: Node;
    floor: Floor;
    arcball: CameraArcball;
	_headNode?: Node;

	constructor() {

    	super();

    	this.width = window.innerWidth;
    	this.height = window.innerHeight;

    	this.canvas = <HTMLCanvasElement>document.getElementById( "experience" );
    	this.canvas.width = this.width;
    	this.canvas.height = this.height;

    	this.camera = new CameraPersp( {
    		aspect: this.canvas.width / this.canvas.height,
    		fov: 45,
    		near: 0.1,
    		far: 1000,
    		position: vec3.fromValues( 0, 4, 16 ),
    		target: vec3.fromValues( 0, 4, 0 ),
    	} );

    	this.arcball = new CameraArcball( this.camera, 4, 0.08 );

    	this.bolt = Bolt.getInstance();
    	this.bolt.init( this.canvas, { antialias: true, dpi: 2 } );
    	this.bolt.setCamera( this.camera );

    	this.floor = new Floor();

    	this.lightPosition = vec3.fromValues( 0, 0, 2 );

    	this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
    	this.bolt.enableDepth();

		this.bolt.enableCullFace();
		this.bolt.cullFace( BACK );

    	this.init();


	}

	async init() {

    	const gltfLoader = new GLTFLoader( this.bolt );

    	this.gltf = await gltfLoader.load( "/static/models/gltf/examples/rigging/", "scene.gltf" );
    	this.gltf.transform.position = vec3.fromValues( 0, 0, 0 );

    	this.assetsLoaded = true;

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

    	if ( ! this.assetsLoaded ) return;

    	this.arcball.update();
    	this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
    	this.bolt.clear( 1, 1, 1, 1 );

    	this.bolt.draw( this.gltf );

	}

	lateUpdate( elapsed: number, delta: number ) {

    	return;

	}

}
