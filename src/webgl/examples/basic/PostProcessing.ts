import Base from "@webgl/Base";
import Bolt, { Shader, Batch, Transform, Mesh, Node } from "@robsouthgate/bolt-core";

import defaultVertex from "../../examples/shaders/default/default.vert";
import defaultFragment from "../../examples/shaders/default/default.frag";

import { vec3, } from "gl-matrix";
import CameraArcball from "../../modules/CameraArcball";
import Sphere from "../../modules/Primitives/Sphere";
import Post from "@/webgl/modules/Post/Post";
import Plane from "@/webgl/modules/Primitives/Plane";
import FXAAPass from "@/webgl/modules/Post/passes/FXAAPass";
import RGBSplitPass from "@/webgl/modules/Post/passes/RGBSplitPass";
import PixelatePass from "@/webgl/modules/Post/passes/PixelatePass";
import RenderPass from "@/webgl/modules/Post/passes/RenderPass";
export default class extends Base {

    canvas: HTMLCanvasElement;
    shader: Shader;
    lightPosition: vec3;
    camera: CameraArcball;
    assetsLoaded?: boolean;
    torusTransform!: Transform;
    sphereBatch!: Batch;
    planeBatch!: Batch;
    post: Post;
    fxaa!: FXAAPass;
    rbgSplit!: RGBSplitPass;
    renderPass!: RenderPass;
    pixelate!: PixelatePass;
    bolt = Bolt.getInstance();
    gl: WebGL2RenderingContext;
    root!: Node;

    constructor() {

    	super();

    	this.width = window.innerWidth;
    	this.height = window.innerHeight;

    	this.canvas = <HTMLCanvasElement>document.getElementById( "experience" );
    	this.canvas.width = this.width;
    	this.canvas.height = this.height;

    	this.camera = new CameraArcball(
    		this.width,
    		this.height,
    		vec3.fromValues( 0, 2, 6 ),
    		vec3.fromValues( 0, 2, 0 ),
    		45,
    		0.01,
    		1000,
    		0.2,
    		2
    	);

    	this.bolt.init( this.canvas, { antialias: true } );
    	this.bolt.setCamera( this.camera );

    	this.gl = this.bolt.getContext();

    	this.post = new Post( this.bolt );

    	this.shader = new Shader( defaultVertex, defaultFragment );
    	this.lightPosition = vec3.fromValues( 0, 10, 0 );

    	this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
    	this.bolt.enableDepth();

    	this.init();


    }

    async init() {

    	this.renderPass = new RenderPass( this.bolt, {
    		width: this.width,
    		height: this.height
    	} ).setEnabled( true );


    	this.rbgSplit = new RGBSplitPass( this.bolt, {
    		width: this.width,
    		height: this.height
    	} ).setEnabled( false );

    	this.pixelate = new PixelatePass( this.bolt, {
    		width: this.width,
    		height: this.height,
    		xPixels: 30,
    		yPixels: 30
    	} ).setEnabled( false );

    	this.fxaa = new FXAAPass( this.bolt, {
    		width: this.width,
    		height: this.height
    	} ).setEnabled( true );

    	this.post.add( this.renderPass );
    	this.post.add( this.rbgSplit );
    	this.post.add( this.pixelate );
    	this.post.add( this.fxaa, true );

    	const sphereGeometry = new Sphere( { radius: 1, widthSegments: 64, heightSegments: 64 } );
    	const planeGeometry = new Plane( { widthSegments: 64, heightSegments: 64 } );

    	this.root = new Node();
    	this.root.transform.scale = vec3.fromValues( 1, 1, 1 );

    	this.sphereBatch = new Batch(
    		new Mesh( sphereGeometry ),
    		this.shader
    	);

    	this.sphereBatch.setParent( this.root );

    	this.planeBatch = new Batch(
    		new Mesh( planeGeometry ),
    		this.shader
    	);

    	this.planeBatch.setParent( this.root );

    	this.planeBatch.transform.scale = vec3.fromValues( 10, 10, 10 );

    	this.planeBatch.transform.rotation[ 0 ] = Math.PI * 0.5;
    	this.planeBatch.transform.position[ 1 ] = - 1;

    	this.resize();

    }

    resize() {

    	this.bolt.resizeFullScreen();

    	this.post.resize( this.bolt.gl.canvas.width, this.bolt.gl.canvas.height );

    }

    earlyUpdate( elapsed: number, delta: number ) {

    	super.earlyUpdate( elapsed, delta );

    }

    update( elapsed: number, delta: number ) {

    	super.update( elapsed, delta );

    	this.post.begin();

    	this.camera.update();

    	this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
    	this.bolt.clear( 1, 1, 1, 1 );

    	this.bolt.draw( [ this.sphereBatch, this.planeBatch ] );

    	this.post.end();


    }

    lateUpdate( elapsed: number, delta: number ) {

    	super.lateUpdate( elapsed, delta );

    }

}
