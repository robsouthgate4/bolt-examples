
import Base from "@webgl/Base";
import Bolt, { CameraPersp, Node, Transform } from "@bolt-webgl/core";

import { vec3 } from "gl-matrix";
import CameraArcball from "@/webgl/modules/CameraArcball";
import GLTFLoader from "@/webgl/modules/GLTFLoader";
import { GlTf } from "@/webgl/modules/GLTFLoader/types/GLTF";
import Floor from "@/webgl/modules/Batches/Floor";

export default class extends Base {

    canvas: HTMLCanvasElement;
    lightPosition: vec3;
    camera: CameraPersp;
    assetsLoaded?: boolean;
    torusTransform!: Transform;
    sphereNode!: Node;
    planeNode!: Node;
    bolt: Bolt;
    gltf!: GlTf;
    floor: Floor;
    arcball: CameraArcball;

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
    		position: vec3.fromValues( 2, 7, 10 ),
    		target: vec3.fromValues( 0, 3, 0 ),
    	} );

    	this.arcball = new CameraArcball( this.camera, 4, 0.08 );

    	this.bolt = Bolt.getInstance();
    	this.bolt.init( this.canvas, { antialias: true, dpi: 1 } );
    	this.bolt.setCamera( this.camera );

    	this.floor = new Floor();

    	this.lightPosition = vec3.fromValues( 0, 0, 2 );

    	this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
    	this.bolt.enableDepth();

    	this.init();


    }

    async init() {

    	const gltfLoader = new GLTFLoader( this.bolt );
    	this.gltf = await gltfLoader.loadGLTF( "/static/models/gltf/", "PhantomLogoPose.gltf" );
    	this.assetsLoaded = true;

    	if ( this.gltf.scenes ) {

    		for ( const scene of this.gltf.scenes ) {

    			scene.root.transform.y = 2.75;

    		}

    	}

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
    	this.bolt.clear( 0.95, 0.95, 0.95, 1 );

    	if ( this.gltf.scenes ) {

    		for ( const scene of this.gltf.scenes ) {

    			this.bolt.draw( scene.root );

    		}

    	}

    	this.bolt.draw( this.floor );


    }

    lateUpdate( elapsed: number, delta: number ) {

    	return;

    }

}
