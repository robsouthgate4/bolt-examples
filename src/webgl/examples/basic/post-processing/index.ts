

import Base from "@webgl/Base";
import Bolt, { Shader, Batch, Transform, Node } from "@bolt-webgl/core";

import normalVertex from "./shaders/normal/normal.vert";
import normalFragment from "./shaders/normal/normal.frag";

import { vec3, } from "gl-matrix";
import CameraArcball from "@webgl/modules/CameraArcball";
import Post from "@/webgl/modules/Post/Post";
import FXAAPass from "@/webgl/modules/Post/passes/FXAAPass";
import RGBSplitPass from "@/webgl/modules/Post/passes/RGBSplitPass";
import PixelatePass from "@/webgl/modules/Post/passes/PixelatePass";
import RenderPass from "@/webgl/modules/Post/passes/RenderPass";
import Floor from "@/webgl/modules/Batches/Floor";
import GLTFLoader from "@/webgl/modules/GLTFLoader";
import { GlTf } from "@/webgl/modules/GLTFLoader/types/GLTF";
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
    gltf!: GlTf;

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
    		vec3.fromValues( 3, 8, 8 ),
    		vec3.fromValues( 0, 3, 0 ),
    		45,
    		0.01,
    		1000,
    		0.1,
    		4
    	);

    	this.bolt.init( this.canvas, { antialias: false, dpi: 2 } );
    	this.bolt.setCamera( this.camera );

    	this.gl = this.bolt.getContext();

    	this.post = new Post( this.bolt );

    	this.shader = new Shader( normalVertex, normalFragment );
    	this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
    	this.bolt.enableDepth();

    	this.init();


    }

    async init() {

    	const gltfLoader = new GLTFLoader( this.bolt );
    	this.gltf = await gltfLoader.loadGLTF( "/static/models/gltf/", "PhantomLogoPose.gltf" );
    	this.assetsLoaded = true;

    	this.rbgSplit = new RGBSplitPass( this.bolt, {
    		width: this.width,
    		height: this.height
    	} ).setEnabled( true );

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

    	this.post.add( this.rbgSplit );
    	this.post.add( this.pixelate );
    	this.post.add( this.fxaa, true );

    	this.root = new Node();
    	this.floorBatch = new Floor();
    	this.floorBatch.setParent( this.root );

    	if ( this.gltf.scenes ) {

    		for ( const scene of this.gltf.scenes ) {

    			scene.root.transform.y = 2;
    			scene.root.setParent( this.root );

    		}

    	}

    	this.resize();

    }

    resize() {

    	this.bolt.resizeFullScreen();

    	this.post.resize( this.gl.canvas.width, this.gl.canvas.height );

    }

    earlyUpdate( elapsed: number, delta: number ) {

    	return;

    }

    update( elapsed: number, delta: number ) {

    	if ( ! this.assetsLoaded ) return;

    	this.camera.update();
    	this.post.begin();

    	this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
    	this.bolt.clear( 0, 0, 0, 1 );

    	this.bolt.draw( this.root );

    	this.post.end();


    }

    lateUpdate( elapsed: number, delta: number ): void {

    	return;

    }

}
