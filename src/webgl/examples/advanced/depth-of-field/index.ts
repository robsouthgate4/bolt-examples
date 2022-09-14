

import Base from "@webgl/Base";
import Bolt, { Program, Transform, Mesh, FBO, Node, CameraPersp } from "@bolt-webgl/core";

import defaultVertexInstanced from "./shaders/instanced/instanced.vert";
import defaultFragmentInstanced from "./shaders/instanced/instanced.frag";

import depthVertexInstanced from "./shaders/depth/depth.vert";
import depthFragmentInstanced from "./shaders/depth/depth.frag";

import { mat4, quat, vec2, vec3, } from "gl-matrix";
import Post from "@/webgl/modules/post";
import RenderPass from "@/webgl/modules/post/passes/RenderPass";
import DOFPass from "@/webgl/modules/post/passes/DOFPass";
import FXAAPass from "@/webgl/modules/post/passes/FXAAPass";
import GLTFLoader from "@/webgl/modules/gltf-loader";
import Sphere from "@/webgl/modules/primitives/Sphere";
import CameraFPS from "@webgl/modules/camera-fps";

export default class extends Base {

	canvas: HTMLCanvasElement;
	colorProgram: Program;
	camera: CameraPersp;
	cameraFPS!: CameraFPS;
	assetsLoaded!: boolean;
	cubeTransform!: Transform;
	torusBuffer!: Mesh;
	toruseGLTFBuffer!: Mesh;
	bolt: Bolt;
	post: Post;
	renderPass!: RenderPass;
	fxaa!: FXAAPass;
	dofPass!: DOFPass;
	depthProgram: Program;
	depthFBO!: FBO;
	gl: WebGL2RenderingContext;
	fxaaPass!: FXAAPass;

	constructor() {

		super();

		const devicePixelRatio = Math.min( 2, window.devicePixelRatio || 1 );

		this.width = window.innerWidth * devicePixelRatio;
		this.height = window.innerHeight * devicePixelRatio;

		this.canvas = <HTMLCanvasElement>document.getElementById( "experience" );
		this.canvas.width = this.width;
		this.canvas.height = this.height;

		this.camera = new CameraPersp( {
			aspect: this.canvas.width / this.canvas.height,
			fov: 45,
			near: 0.1,
			far: 1000,
			position: vec3.fromValues( 0, 5, 10 ),
			target: vec3.fromValues( 0, 0, - 50 ),
		} );

		this.cameraFPS = new CameraFPS( this.camera );

		this.bolt = Bolt.getInstance();
		this.bolt.init( this.canvas, { antialias: true, dpi: 1 } );
		this.bolt.setCamera( this.camera );
		this.gl = this.bolt.getContext();

		this.post = new Post( this.bolt );

		this.depthProgram = new Program( depthVertexInstanced, depthFragmentInstanced );
		this.colorProgram = new Program( defaultVertexInstanced, defaultFragmentInstanced );

		this.camera.lookAt( vec3.fromValues( 0, 0, - 50 ) );

		this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
		this.bolt.enableDepth();

		this.init();


	}

	async init() {

		this.depthFBO = new FBO( { width: this.canvas.width, height: this.canvas.height, depth: true } );

		this.dofPass = new DOFPass( this.bolt, {
			width: this.width,
			height: this.height
		} ).setEnabled( true );

		this.fxaaPass = new FXAAPass( this.bolt, {
			width: this.width,
			height: this.height
		} ).setEnabled( true );

		this.post.add( this.dofPass );
		this.post.add( this.fxaaPass, true );

		// set program uniforms
		this.depthProgram.activate();
		this.depthProgram.setVector2( "cameraPlanes", vec2.fromValues( this.camera.near, this.camera.far ) );

		this.dofPass.program.activate();
		this.dofPass.program.setTexture( "depthMap", this.depthFBO.targetTexture );
		this.dofPass.program.setFloat( "focus", 0.0 );
		this.dofPass.program.setFloat( "aperture", 0.028 );
		this.dofPass.program.setFloat( "maxBlur", 1.0 );
		this.dofPass.program.setFloat( "aspect", this.gl.canvas.width / this.gl.canvas.height );

		const instanceCount = 500;

		const instanceMatrices: mat4[] = [];

		for ( let i = 0; i < instanceCount; i ++ ) {

			const x = ( Math.random() * 2 - 1 ) * 40;
			const y = ( Math.random() * 2 - 1 ) * 20;
			const z = Math.random() * 100;

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

		const gltf: Node = await gltfLoader.load( "/static/models/gltf/torus.gltf" );

		if ( ! gltf ) return;

		this.assetsLoaded = true;

		this.torusBuffer = new Mesh( new Sphere(), {
			instanceCount,
			instanced: true,
			instanceMatrices
		} );

		this.resize();

	}

	resize() {

		this.bolt.resizeFullScreen();
		this.camera.updateProjection( this.canvas.width / this.canvas.height );
		this.post.resize( this.gl.canvas.width, this.gl.canvas.height );
		this.depthFBO.resize( this.gl.canvas.width, this.gl.canvas.height );

	}

	earlyUpdate( elapsed: number, delta: number ) {

		return;

	}

	drawInstances( program: Program, elapsed: number, delta: number ) {

		this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
		this.bolt.clear( 0.0, 0.0, 0.0, 1 );

		this.cameraFPS.update( delta );

		program.activate();
		program.setVector3( "viewPosition", this.camera.position );
		program.setFloat( "time", elapsed );
		program.setMatrix4( "projection", this.camera.projection );
		program.setMatrix4( "view", this.camera.view );

		this.torusBuffer.draw( program );

	}

	update( elapsed: number, delta: number ) {

		if ( ! this.assetsLoaded ) return;

		{ // Draw depth to framebuffer

			this.depthFBO.bind();
			this.bolt.enableDepth();
			this.drawInstances( this.depthProgram, elapsed, delta );
			this.depthFBO.unbind();
			this.bolt.disableDepth();

		}

		{ // draw post process stack and set depth map

			this.post.begin();
			this.drawInstances( this.colorProgram, elapsed, delta );
			this.post.end();

		}


	}

	lateUpdate( elapsed: number, delta: number ) {

		return;

	}

}
