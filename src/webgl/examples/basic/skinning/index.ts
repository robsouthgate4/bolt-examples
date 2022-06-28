
import Base from "@webgl/Base";
import Bolt, { Batch, CameraPersp, Node, Shader } from "@bolt-webgl/core";

import { vec3 } from "gl-matrix";
import CameraArcball from "@/webgl/modules/CameraArcball";
import Floor from "@/webgl/modules/batches/floor";
import GLTFLoader from "@/webgl/modules/gltf-loader";

import skinVertexShader from "./shaders/skin/skin.vert";
import skinFragmentShader from "./shaders/skin/skin.frag";

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
    		position: vec3.fromValues( 4, 4, 8 ),
    		target: vec3.fromValues( 0, 2, 0 ),
    	} );

    	this.arcball = new CameraArcball( this.camera, 4, 0.08 );

    	this.bolt = Bolt.getInstance();
    	this.bolt.init( this.canvas, { antialias: true, dpi: 2 } );
    	this.bolt.setCamera( this.camera );

    	this.floor = new Floor();

    	this.lightPosition = vec3.fromValues( 0, 0, 2 );

    	this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
    	this.bolt.enableDepth();

    	this.init();


    }

    async init() {

    	const gltfLoader = new GLTFLoader( this.bolt );

    	this.gltf = await gltfLoader.load( "/static/models/gltf/examples/sonic/", "scene.gltf" );

    	const shader = new Shader( skinVertexShader, skinFragmentShader );

    	this.gltf.transform.position = vec3.fromValues( 0, 0, 0 );
    	this.gltf.transform.scale = vec3.fromValues( 0.1, 0.1, 0.1 );

    	this.gltf.traverse( ( node: Node ) => {

    		if ( node instanceof Batch ) {

    			node.shader = shader;

    		} else {

    			console.log( node.name );

    			if ( node.name === "Shoulder_L_Reference" ) {

    				node.transform.rotateZ = Math.PI * 0.1;

    			}

    			if ( node.name === "Shoulder_R_Reference" ) {

    				node.transform.rotateZ = Math.PI * 0.1;

    			}

    		}

    	} );


    	this.assetsLoaded = true;

    	this.resize();

    	if ( ! this.assetsLoaded ) return;

    	this.arcball.update();

    	this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
    	this.bolt.clear( 1, 1, 1, 1 );

    	this.bolt.draw( [ this.gltf, this.floor ] );

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

    	this.bolt.draw( [ this.gltf, this.floor ] );

    }

    lateUpdate( elapsed: number, delta: number ) {

    	return;

    }

}
