import Base from "@webgl/Base";
import Bolt, { Shader, Transform, ArrayBuffer, FBO, Camera, Node } from "@robsouthgate/bolt-core";

import defaultVertexInstanced from "../../examples/shaders/defaultInstanced/defaultInstanced.vert";
import defaultFragmentInstanced from "../../examples/shaders/defaultInstanced/defaultInstanced.frag";

import depthVertexInstanced from "../../examples/shaders/depth/depth.vert";
import depthFragmentInstanced from "../../examples/shaders/depth/depth.frag";

import { mat4, quat, vec2, vec3, } from "gl-matrix";
import CameraFPS from "@/webgl/modules/CameraFPS";
import Post from "@/webgl/modules/Post/Post";
import RenderPass from "@/webgl/modules/Post/passes/RenderPass";
import DOFPass from "@/webgl/modules/Post/passes/DOFPass";
import FXAAPass from "@/webgl/modules/Post/passes/FXAAPass";
import GLTFLoader from "@/webgl/modules/GLTFLoader";

export default class extends Base {

    canvas: HTMLCanvasElement;
    colorShader: Shader;
    lightPosition: vec3;
    camera: CameraFPS;
    assetsLoaded!: boolean;
    cubeTransform!: Transform;
    torusBuffer!: ArrayBuffer;
    toruseGLTFBuffer!: ArrayBuffer;
    bolt: Bolt;
    post: Post;
    renderPass!: RenderPass;
    fxaa!: FXAAPass;
    dofPass!: DOFPass;
    depthShader: Shader;
    depthFBO!: FBO;

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
    		vec3.fromValues( 0, 5, - 5 ),
    		45,
    		0.1,
    		500,
    	);

    	this.bolt = Bolt.getInstance();
    	this.bolt.init( this.canvas, { antialias: true } );
    	this.bolt.setCamera( this.camera );

    	this.post = new Post( this.bolt );

    	this.depthShader = new Shader( depthVertexInstanced, depthFragmentInstanced );
    	this.colorShader = new Shader( defaultVertexInstanced, defaultFragmentInstanced );

    	this.lightPosition = vec3.fromValues( 0, 10, 0 );

    	this.camera.lookAt( vec3.fromValues( 0, 0, - 50 ) );

    	this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
    	this.bolt.enableDepth();

    	this.init();


    }

    async init() {



    	this.depthFBO = new FBO( { width: this.canvas.width, height: this.canvas.height, depth: true } );

    	this.renderPass = new RenderPass( this.bolt, {
    		width: this.width,
    		height: this.height,
    	} ).setEnabled( true );

    	this.dofPass = new DOFPass( this.bolt, {
    		width: this.width,
    		height: this.height
    	} ).setEnabled( true );

    	this.post.add( this.renderPass );
    	this.post.add( this.dofPass, true );

    	// set shader uniforms
    	this.colorShader.activate();
    	this.colorShader.setVector3( "objectColor", vec3.fromValues( 1.0, 0.0, 0.0 ) );
    	this.colorShader.setVector3( "lightColor", vec3.fromValues( 0.95, 1.0, 1.0 ) );

    	this.depthShader.activate();
    	this.depthShader.setVector2( "cameraPlanes", vec2.fromValues( this.camera.near, this.camera.far ) );

    	this.dofPass.shader.activate();
    	this.dofPass.shader.setTexture( "depthMap", this.depthFBO.targetTexture );
    	this.dofPass.shader.setFloat( "focus", 7 );
    	this.dofPass.shader.setFloat( "aperture", 4.0 * 0.0001 );
    	this.dofPass.shader.setFloat( "maxBlur", 0.1 );
    	this.dofPass.shader.setFloat( "aspect", this.bolt.gl.canvas.width / this.bolt.gl.canvas.height );

    	const instanceCount = 1000;

    	const instanceMatrices: mat4[] = [];

    	for ( let i = 0; i < instanceCount; i ++ ) {

    		const x = ( Math.random() * 2 - 1 ) * 50;
    		const y = ( Math.random() * 2 - 1 ) * 20;
    		const z = Math.random() * 200;

    		const tempTranslation = vec3.fromValues( x, y, - z );

    		const tempQuat = quat.create();
    		const tempRotation = quat.fromEuler( tempQuat, Math.random() * 360, Math.random() * 360, Math.random() * 360 );
    		const tempScale = vec3.fromValues( 1, 1, 1 );

    		const translation = mat4.create();
    		mat4.fromTranslation( translation, tempTranslation );

    		const rotation = mat4.create();
    		mat4.fromQuat( rotation, tempRotation );

    		const scale = mat4.create();
    		mat4.fromScaling( scale, tempScale );

    		const combined = mat4.create();
    		mat4.multiply( combined, translation, rotation );
    		mat4.multiply( combined, combined, scale );

    		instanceMatrices.push( combined );

    	}

    	const gltfLoader = new GLTFLoader( this.bolt );

    	const gltf = await gltfLoader.loadGLTF( "/static/models/gltf", "torus.gltf" );

    	if ( ! gltf ) return;

    	this.assetsLoaded = true;

    	if ( gltf.scenes ) {

    		for ( const scene of gltf.scenes ) {

    			scene.root.traverse( ( node: Node ) => {

    				if ( node.name === "Torus" ) {

    					const buffer = node.drawables[ 0 ];

    				    this.torusBuffer = new ArrayBuffer( {
    						positions: buffer.positions,
    						normals: buffer.normals,
    						uvs: buffer.uvs,
    						indices: buffer.indices
    					}, {
    						instanceCount,
    						instanced: true,
    						instanceMatrices
    					} );

    				}

    			} );

    		}

    	}

    	this.resize();

    }

    resize() {

    	this.bolt.resizeFullScreen();
    	this.post.resize( this.bolt.gl.canvas.width, this.bolt.gl.canvas.height );
    	this.depthFBO.resize( this.bolt.gl.canvas.width, this.bolt.gl.canvas.height );

    }

    earlyUpdate( elapsed: number, delta: number ) {

    	super.earlyUpdate( elapsed, delta );

    }

    drawInstances( shader: Shader, elapsed: number ) {

    	this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
    	this.bolt.clear( 1, 1, 1, 1 );

    	shader.activate();
    	shader.setVector3( "viewPosition", this.camera.position );
    	shader.setFloat( "time", elapsed );
    	shader.setMatrix4( "projection", this.camera.getProjectionMatrix() );
    	shader.setMatrix4( "view", this.camera.getViewMatrix() );

    	this.torusBuffer.drawTriangles( shader );

    }

    update( elapsed: number, delta: number ) {

    	if ( ! this.assetsLoaded ) return;

    	super.update( elapsed, delta );
    	this.camera.update( delta );

    	{ // Draw depth shaded to depth framebuffer

    		this.depthFBO.bind();

    		this.bolt.enableDepth();

    		this.drawInstances( this.depthShader, elapsed );

    		this.depthFBO.unbind();

    		this.bolt.disableDepth();

    	}

    	{ // draw post process stack and set depth map

    		this.post.begin();

    		this.drawInstances( this.colorShader, elapsed );

    		this.torusBuffer.drawTriangles( this.colorShader );

    		this.post.end();

    	}



    }

    lateUpdate( elapsed: number, delta: number ) {

    	super.lateUpdate( elapsed, delta );

    }

}
