import Base from "@webgl/Base";
import Bolt, { Shader, Node, Transform, Batch, Camera, FBO, Texture, RGBA16F, COLOR_ATTACHMENT0, RBO } from "@bolt-webgl/core";

import FXAAPass from "@/webgl/modules/Post/passes/FXAAPass";
import CopyPass from "@/webgl/modules/Post/passes/CopyPass";
import RGBSplitPass from "@/webgl/modules/Post/passes/RGBSplitPass";
import PixelatePass from "@/webgl/modules/Post/passes/PixelatePass";
import RenderPass from "@/webgl/modules/Post/passes/RenderPass";


import bodyVertex from "../../examples/shaders/phantom/body/body.vert";
import bodyFragment from "../../examples/shaders/phantom/body/body.frag";

import eyesVertex from "../../examples/shaders/phantom/eyes/eyes.vert";
import eyesFragment from "../../examples/shaders/phantom/eyes/eyes.frag";


import geometryVertex from "../../examples/shaders/phantom/geometry/geometry.vert";
import geometryFragment from "../../examples/shaders/phantom/geometry/geometry.frag";

import { vec3, } from "gl-matrix";
import CameraArcball from "../../modules/CameraArcball";
import GLTFLoader from "@/webgl/modules/GLTFLoader";
import { GlTf } from "@/webgl/modules/GLTFLoader/types/GLTF";
import Post from "@/webgl/modules/Post/Post";
import Axis from "@/webgl/modules/Batches/Axis";
import Floor from "@/webgl/modules/Batches/Floor";

export default class extends Base {

    canvas: HTMLCanvasElement;
    bodyShader: Shader;
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
    axis!: Axis;
    eyesShader: Shader;
    floor!: Floor;
    gBuffer: FBO;
    normalTexture: Texture;
    geometryShader: Shader;
    copyPass: CopyPass;
    gBufferRBO: RBO;

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
    		vec3.fromValues( 4, 8, 10 ),
    		vec3.fromValues( 0, 3, 0 ),
    		45,
    		0.01,
    		1000,
    		0.1,
    		2,
    		0.6
    	);

    	this.bolt = Bolt.getInstance();
    	this.bolt.init( this.canvas, { antialias: true, dpi: 2 } );
    	this.bolt.setCamera( this.camera );

    	this.gl = this.bolt.getContext();

    	this.bodyShader = new Shader( bodyVertex, bodyFragment );
    	this.eyesShader = new Shader( eyesVertex, eyesFragment );
    	this.geometryShader = new Shader( geometryVertex, geometryFragment );

    	this.bolt.enableDepth();

    	this.gBuffer = new FBO( { width: this.canvas.width, height: this.canvas.height } );
    	this.gBuffer.bind();
    	this.gBufferRBO = new RBO( { width: this.canvas.width, height: this.canvas.height } );
    	this.gBuffer.unbind();

    	this.normalTexture = new Texture( { width: this.canvas.width, height: this.canvas.height } );

    	this.gBuffer.bind();
    	this.gBuffer.addAttachment( this.normalTexture, COLOR_ATTACHMENT0 + 1 );
    	this.gBuffer.setDrawBuffers();
    	this.gBuffer.unbind();

    	this.copyPass = new CopyPass( this.bolt, { width: this.canvas.width, height: this.canvas.height } );

    	this.post = new Post( this.bolt );

    	this.fxaa = new FXAAPass( this.bolt, {
    		width: this.width,
    		height: this.height
    	} ).setEnabled( true );

    	this.post.add( this.fxaa, true );

    	this.init();


    }

    async init() {

    	const gltfLoader = new GLTFLoader( this.bolt );
    	this.gltf = await gltfLoader.loadGLTF( "/static/models/gltf", "PhantomLogoPose.gltf" );
    	this.assetsLoaded = true;

    	this.axis = new Axis();
    	this.axis.transform.y = 0.01;

    	this.floor = new Floor();

    	if ( this.gltf.scenes ) {

    		for ( const scene of this.gltf.scenes ) {

    			scene.root.traverse( ( node: Node ) => {

    				if ( node.name === "phantom_logoPose" ) {

    					node.transform.y = 2.8;

    					const batch1 = <Batch>node.children[ 0 ];
    					batch1.shader = this.bodyShader;

    					const batch2 = <Batch>node.children[ 1 ];
    					batch2.shader = this.eyesShader;

    				}

    			} );

    		}

    	}

    	this.resize();

    }

    resize() {

    	this.bolt.resizeFullScreen();
    	this.post.resize( this.gl.canvas.width, this.gl.canvas.height );
    	this.gBuffer.resize( this.gl.canvas.width, this.gl.canvas.height );
    	this.gBufferRBO.resize( this.gl.canvas.width, this.gl.canvas.height );

    }

    earlyUpdate( elapsed: number, delta: number ) {

    	return;

    }

    drawScene( type = "normal" ) {

    	this.camera.update();
    	this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
    	this.bolt.clear( 0.9, 0.9, 0.9, 1 );

    	if ( this.gltf.scenes ) {

    		for ( const scene of this.gltf.scenes ) {

    			scene.root.traverse( ( node: Node ) => {

    				if ( node.name === "phantom_logoPose" ) {

    					if ( type === "geometry" ) {

    						node.children.forEach( ( batch: Node ) => {

    							if ( type === "geometry" ) {

    								const b = <Batch>batch;
    								b.shader = this.geometryShader;

    							}

    						} );

    					} else {

    						const batch1 = <Batch>node.children[ 0 ];
    						batch1.shader = this.bodyShader;

    						const batch2 = <Batch>node.children[ 1 ];
    						batch2.shader = this.eyesShader;

    					}

    				}

    				this.bolt.draw( node );

    			} );

    		}

    	}

    	if ( type === "normal" ) {

    		this.bolt.draw( [ this.axis, this.floor ] );

    	}


    }

    update( elapsed: number, delta: number ) {

    	if ( ! this.assetsLoaded ) return;

    	this.gBuffer.bind();
    	this.drawScene( "geometry" );
    	this.gBuffer.unbind();

    	this.copyPass.shader.setTexture( "map", this.normalTexture );
    	this.copyPass.shader.activate();
    	this.copyPass.fullScreenTriangle.drawTriangles( this.copyPass.shader );

    	this.post.begin();
    	this.drawScene( "normal" );
    	this.post.end();


    }

    lateUpdate( elapsed: number, delta: number ) {

    	return;

    }

}
