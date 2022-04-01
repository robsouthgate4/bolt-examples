import Base from "@webgl/Base";
import Bolt, { Mesh, Shader, Transform } from "@robsouthgate/bolt-core";

import GLTFLoader from "@/webgl/modules/GLTFLoader";

import defaultVertexInstanced from "../../examples/shaders/defaultInstanced/defaultInstanced.vert";
import defaultFragmentInstanced from "../../examples/shaders/defaultInstanced/defaultInstanced.frag";

import { mat4, quat, vec3, } from "gl-matrix";
import CameraFPS from "@/webgl/modules/CameraFPS";
export default class extends Base {

    canvas: HTMLCanvasElement;
    shader: Shader;
    lightPosition: vec3;
    camera: CameraFPS;
    assetsLoaded!: boolean;
    cubeTransform!: Transform;
    torusBuffer!: Mesh;
    bolt: Bolt;

    constructor() {

    	super();

    	const devicePixelRatio = Math.min( 2, window.devicePixelRatio || 1 );

    	this.width = window.innerWidth * devicePixelRatio;
    	this.height = window.innerHeight * devicePixelRatio;

    	this.canvas = <HTMLCanvasElement>document.getElementById( "experience" );
    	this.canvas.width = this.width;
    	this.canvas.height = this.height;

    	this.camera = new CameraFPS(
    		this.width,
    		this.height,
    		vec3.fromValues( 0, 15, 10 ),
    		45,
    		0.01,
    		1000,
    	);

    	this.bolt = Bolt.getInstance();
    	this.bolt.init( this.canvas, { antialias: true } );
    	this.bolt.setCamera( this.camera );

    	this.shader = new Shader( defaultVertexInstanced, defaultFragmentInstanced );
    	this.lightPosition = vec3.fromValues( 0, 10, 0 );

    	this.camera.lookAt( vec3.fromValues( 0, 0, - 50 ) );

    	this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
    	this.bolt.enableDepth();


    }

    resize() {

    	this.bolt.resizeFullScreen();

    }

    earlyUpdate( elapsed: number, delta: number ) {

    	super.earlyUpdate( elapsed, delta );

    }

    update( elapsed: number, delta: number ) {

    	if ( ! this.assetsLoaded ) return;

    	super.update( elapsed, delta );

    	this.camera.update( delta );

    	this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
    	this.bolt.clear( 1, 1, 1, 1 );

    	this.shader.activate();
    	this.shader.setVector3( "viewPosition", this.camera.position );
    	this.shader.setFloat( "time", elapsed );
    	this.shader.setMatrix4( "projection", this.camera.getProjectionMatrix() );
    	this.shader.setMatrix4( "view", this.camera.getViewMatrix() );

    	this.torusBuffer.drawTriangles( this.shader );

    }

    lateUpdate( elapsed: number, delta: number ) {

    	super.lateUpdate( elapsed, delta );

    }

}
