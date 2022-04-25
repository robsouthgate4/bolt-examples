import Base from "@webgl/Base";
import Bolt, { Shader, Batch, Transform, Mesh, Node } from "@bolt-webgl/core";

import defaultVertex from "../../examples/shaders/default/default.vert";
import defaultFragment from "../../examples/shaders/default/default.frag";

import { vec3, } from "gl-matrix";
import CameraArcball from "../../modules/CameraArcball";
import Sphere from "../../modules/Primitives/Sphere";
import Post from "@/webgl/modules/Post/Post";
import FXAAPass from "@/webgl/modules/Post/passes/FXAAPass";
import RGBSplitPass from "@/webgl/modules/Post/passes/RGBSplitPass";
import PixelatePass from "@/webgl/modules/Post/passes/PixelatePass";
import RenderPass from "@/webgl/modules/Post/passes/RenderPass";
import Floor from "@/webgl/modules/Batches/Floor";
export default class extends Base {

    canvas: HTMLCanvasElement;
    shader: Shader;
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
    floorBatch!: Floor;

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
    		vec3.fromValues( 3, 3, 8 ),
    		vec3.fromValues( 0, 0, 0 ),
    		45,
    		0.01,
    		1000,
    		0.1,
    		4
    	);

    	this.bolt.init( this.canvas, { antialias: false, dpi: 1 } );
    	this.bolt.setCamera( this.camera );

    	this.gl = this.bolt.getContext();

    	this.post = new Post( this.bolt );

    	this.shader = new Shader( defaultVertex, defaultFragment );
    	this.bolt.setViewPort( 0, 0, this.canvas.clientWidth, this.canvas.clientHeight );
    	this.bolt.enableDepth();

    	this.init();


    }

    async init() {


    	this.rbgSplit = new RGBSplitPass( this.bolt, {
    		width: this.width,
    		height: this.height
    	} ).setEnabled( true );

    	this.pixelate = new PixelatePass( this.bolt, {
    		width: this.width,
    		height: this.height,
    		xPixels: 80,
    		yPixels: 80
    	} ).setEnabled( true );

    	this.fxaa = new FXAAPass( this.bolt, {
    		width: this.width,
    		height: this.height
    	} ).setEnabled( true );

    	this.post.add( this.rbgSplit );
    	this.post.add( this.fxaa, true );

    	const sphereGeometry = new Sphere( { radius: 1, widthSegments: 64, heightSegments: 64 } );

    	this.root = new Node();

    	this.sphereBatch = new Batch(
    		new Mesh( sphereGeometry ),
    		this.shader
    	);

    	this.floorBatch = new Floor();
    	this.floorBatch.setParent( this.root );

    	this.sphereBatch.transform.y = 1;

    	this.sphereBatch.setParent( this.root );

    	this.resize();

    }

    resize() {

    	this.bolt.resizeFullScreen();

    	this.post.resize( this.gl.canvas.clientWidth, this.gl.canvas.clientHeight );

    }

    earlyUpdate( elapsed: number, delta: number ) {

    	return;

    }

    update( elapsed: number, delta: number ) {

    	this.camera.update();
    	this.post.begin();


    	this.bolt.setViewPort( 0, 0, this.canvas.clientWidth, this.canvas.clientHeight );
    	this.bolt.clear( 1, 1, 1, 1 );

    	this.root.traverse( ( node: Node ) => {

    		this.bolt.draw( node );

    	} );

    	this.post.end();


    }

    lateUpdate( elapsed: number, delta: number ): void {

    	return;

    }

}
