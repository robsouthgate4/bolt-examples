

/// @ts-nocheck
import Base from "@webgl/Base";
import Bolt, { Shader, Transform, Mesh, Texture } from "@bolt-webgl/core";
import vertexShader from "./shaders/raymarch.vert";
import fragmentShader from "./shaders/raymarch.frag";

import { vec3, } from "gl-matrix";
import CameraArcball from "@webgl/modules/CameraArcball";
import Cube from "@/webgl/modules/Primitives/Cube";
import Post from "@/webgl/modules/Post/Post";
import FXAAPass from "@/webgl/modules/Post/passes/FXAAPass";
import Batch from "@bolt-webgl/core/lib/Batch";

export default class extends Base {

    canvas: HTMLCanvasElement;
    shader: Shader;
    lightPosition: vec3;
    camera: CameraArcball;
    assetsLoaded!: boolean;
    torusTransform!: Transform;
    cubeBatch!: Batch;
    bolt: Bolt;
    post: Post;

    constructor() {

    	super();

    	this.width = window.innerWidth;
    	this.height = window.innerHeight;

    	this.canvas = <HTMLCanvasElement>document.getElementById( "experience" );
    	this.canvas.width = this.width;
    	this.canvas.height = this.height;

    	this.bolt = Bolt.getInstance();
    	this.bolt.init( this.canvas, { antialias: true } );

    	this.shader = new Shader( vertexShader, fragmentShader );
    	this.lightPosition = vec3.fromValues( 0, 10, 0 );

    	this.camera = new CameraArcball(
    		this.width,
    		this.height,
    		vec3.fromValues( 0, 0.5, 1 ),
    		vec3.fromValues( 0, 0, 0 ),
    		45,
    		0.01,
    		1000,
    		0.2,
    		2
    	);

    	this.post = new Post( this.bolt );

    	this.post.add( new FXAAPass( this.bolt, {
    		width: this.width,
    		height: this.height,
    	} ), true );

    	this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
    	this.bolt.setCamera( this.camera );
    	this.bolt.enableDepth();

    	this.init();


    }

    async init() {

    	const geometry = new Cube();

    	const equiTexture = new Texture( { imagePath: "/static/textures/equi-studio.jpg" } );
    	await equiTexture.load();


    	this.assetsLoaded = true;

    	this.shader.activate();
    	this.shader.setTexture( "mapEqui", equiTexture );

    	// setup nodes
    	this.cubeBatch = new Batch(
    		new Mesh( geometry ),
    		this.shader
    	);

    	this.resize();

    }

    resize() {

    	this.bolt.resizeFullScreen();
    	this.post.resize( this.bolt.getContext().canvas.width, this.bolt.getContext().canvas.height );

    }

    earlyUpdate( elapsed: number, delta: number ) {

    	return;

    }

    update( elapsed: number, delta: number ) {

    	if ( ! this.assetsLoaded ) return;

    	this.post.begin();
    	this.camera.update();

    	const bgColor = 211 / 255;

    	this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
    	this.bolt.clear( bgColor, bgColor, bgColor, 1 );

    	this.shader.activate();
    	this.shader.setVector3( "viewPosition", this.camera.position );
    	this.shader.setFloat( "time", elapsed );

    	this.bolt.draw( this.cubeBatch );

    	this.post.end();

    }

    lateUpdate( elapsed: number, delta: number ) {

    	return;

    }

}
