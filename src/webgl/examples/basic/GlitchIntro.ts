import Base from "@webgl/Base";
import Bolt, { Shader, Node, Transform, Batch, Camera, BACK } from "@bolt-webgl/core";

import defaultVertex from "../../examples/shaders/default/default.vert";
import defaultFragment from "../../examples/shaders/default/default.frag";

import FXAAPass from "@/webgl/modules/Post/passes/FXAAPass";
import RGBSplitPass from "@/webgl/modules/Post/passes/RGBSplitPass";
import PixelatePass from "@/webgl/modules/Post/passes/PixelatePass";
import RenderPass from "@/webgl/modules/Post/passes/RenderPass";


import colorVertex from "../../examples/shaders/color/color.vert";
import colorFragment from "../../examples/shaders/color/color.frag";

import { mat3, vec3, } from "gl-matrix";
import CameraArcball from "../../modules/CameraArcball";
import GLTFLoader from "@/webgl/modules/GLTFLoader";
import { GlTf } from "@/webgl/modules/GLTFLoader/types/GLTF";
import Post from "@/webgl/modules/Post/Post";

export default class extends Base {

    canvas: HTMLCanvasElement;
    shader: Shader;
    lightPosition: vec3;
    camera: Camera;
    assetsLoaded?: boolean;
    torusTransform!: Transform;
    sphereNode!: Node;
    planeNode!: Node;
    bolt: Bolt;
    gltf!: GlTf;
    post!: Post;
    fxaa!: FXAAPass;
    rbgSplit!: RGBSplitPass;
    renderPass!: RenderPass;
    pixelate!: PixelatePass;
    gl: WebGL2RenderingContext;

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
    		vec3.fromValues( 0, 0, 20 ),
    		vec3.fromValues( 0, 2, 0 ),
    		45,
    		0.01,
    		1000,
    		0.1,
    		2,
    		0.6
    	);

    	this.bolt = Bolt.getInstance();
    	this.bolt.init( this.canvas, { antialias: false, dpi: 2 } );
    	this.bolt.setCamera( this.camera );

    	this.gl = this.bolt.getContext();

    	this.shader = new Shader( colorVertex, colorFragment );
    	this.lightPosition = vec3.fromValues( 0, 0, 2 );

    	this.bolt.enableDepth();

    	this.post = new Post( this.bolt );

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
    		xPixels: 80,
    		yPixels: 80
    	} ).setEnabled( false );

    	this.fxaa = new FXAAPass( this.bolt, {
    		width: this.width,
    		height: this.height
    	} ).setEnabled( true );

    	this.post.add( this.renderPass );
    	// this.post.add( this.pixelate );
    	//this.post.add( this.rbgSplit, true );
    	this.post.add( this.fxaa, true );

    	this.init();


    }

    async init() {

    	const gltfLoader = new GLTFLoader( this.bolt );
    	this.gltf = await gltfLoader.loadGLTF( "/static/models/gltf", "PhantomLogoPose.gltf" );
    	this.assetsLoaded = true;

    	if ( this.gltf.scenes ) {

    		for ( const scene of this.gltf.scenes ) {

    			scene.root.traverse( ( node: Node ) => {

    				if ( node.name === "phantom_logoPose" ) {

    					const batch1 = <Batch>node.children[ 0 ];
    					batch1.shader = this.shader;

    					const batch2 = <Batch>node.children[ 1 ];
    					batch2.shader = this.shader;

    				}

    			} );

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

    	this.post.begin();

    	this.camera.position[ 0 ] = Math.sin( elapsed ) * ( Math.PI * 2 );

    	this.camera.update();
    	this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
    	this.bolt.clear( 0, 0, 0, 1 );

    	this.shader.setFloat( "time", elapsed );

    	if ( this.gltf.scenes ) {

    		for ( const scene of this.gltf.scenes ) {

    			scene.root.traverse( ( node: Node ) => {

    				this.bolt.draw( node );

    			} );

    		}

    	}

    	this.post.end();


    }

    lateUpdate( elapsed: number, delta: number ) {

    	return;

    }

}
