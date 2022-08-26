

import Base from "@webgl/Base";
import Bolt, { Shader, Node, Batch, FBO, Texture2D, COLOR_ATTACHMENT0, RBO, NEAREST, CameraPersp } from "@bolt-webgl/core";

import FXAAPass from "@/webgl/modules/post/passes/FXAAPass";
import geometryVertex from "./shaders/geometry/geometry.vert";
import geometryFragment from "./shaders/geometry/geometry.frag";
import compositionVertex from "./shaders/composition/composition.vert";
import compositionFragment from "./shaders/composition/composition.frag";

import { vec2, vec3, vec4, } from "gl-matrix";
import CameraFPS from "@webgl/modules/CameraFPS";
import GLTFLoader from "@/webgl/modules/gltf-loader";
import Post from "@/webgl/modules/post";
import Axis from "@/webgl/modules/batches/axis";
import Floor from "@/webgl/modules/batches/floor";
import Cube from "@/webgl/modules/primitives/Cube";
import ShaderPass from "@/webgl/modules/post/passes/ShaderPass";

export default class extends Base {

	canvas: HTMLCanvasElement;
	bodyShader!: Shader;
	eyesShader!: Shader;
	camera: CameraPersp;
	assetsLoaded?: boolean;
	bolt: Bolt;
	gltf!: Node;
	post!: Post;
	fxaa!: FXAAPass;
	gl: WebGL2RenderingContext;
	axis!: Axis;
	floor!: Floor;
	gBuffer: FBO;
	normalTexture: Texture2D;
	geometryShader: Shader;
	gBufferRBO: RBO;
	cubeBatch!: Batch;
	comp: ShaderPass;
	compShader: Shader;
	depthTexture: Texture2D;
	uvTexture: Texture2D;
	fpsCamera: CameraFPS;

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
			position: vec3.fromValues( 0, 3, 6 ),
			target: vec3.fromValues( 0, 0.5, 0 ),
		} );

		this.fpsCamera = new CameraFPS( this.camera );

		this.bolt = Bolt.getInstance();
		this.bolt.init( this.canvas, { antialias: true, dpi: 2, powerPreference: "high-performance" } );
		this.bolt.setCamera( this.camera );

		this.gl = this.bolt.getContext();

		this.geometryShader = new Shader( geometryVertex, geometryFragment );
		this.geometryShader.activate();
		this.geometryShader.setVector2( "cameraPlanes", vec2.fromValues( this.camera.near, this.camera.far ) );

		this.bolt.enableDepth();

		this.gBuffer = new FBO( { width: this.canvas.width, height: this.canvas.height } );
		this.gBuffer.bind();
		this.gBufferRBO = new RBO( { width: this.canvas.width, height: this.canvas.height } );
		this.gBuffer.unbind();

		this.normalTexture = new Texture2D( { width: this.canvas.width, height: this.canvas.height } );
		this.depthTexture = new Texture2D( { width: this.canvas.width, height: this.canvas.height } );
		this.uvTexture = new Texture2D( { width: this.canvas.width, height: this.canvas.height } );

		this.gBuffer.bind();
		this.gBuffer.addAttachment( this.normalTexture, COLOR_ATTACHMENT0 + 1 );
		this.gBuffer.addAttachment( this.depthTexture, COLOR_ATTACHMENT0 + 2 );
		this.gBuffer.addAttachment( this.uvTexture, COLOR_ATTACHMENT0 + 3 );
		this.gBuffer.setDrawBuffers();
		this.gBuffer.unbind();

		this.post = new Post( this.bolt );

		this.compShader = new Shader( compositionVertex, compositionFragment );
		this.compShader.activate();
		this.compShader.setVector2( "resolution", vec2.fromValues( this.canvas.clientWidth, this.canvas.clientHeight ) );
		this.compShader.setFloat( "thickness", 0.75 );

		this.comp = new ShaderPass( this.bolt, {
			width: this.width,
			height: this.height,
			shader: this.compShader
		} ).setEnabled( true );

		this.fxaa = new FXAAPass( this.bolt, {
			width: this.width,
			height: this.height
		} ).setEnabled( true );


		this.post.add( this.comp, false );
		this.post.add( this.fxaa, true );

		this.init();


	}

	async init() {

		const gltfLoader = new GLTFLoader( this.bolt );
		this.gltf = await gltfLoader.load( "/static/models/gltf/examples/toon/scene.glb" );

		this.assetsLoaded = true;

		this.axis = new Axis();
		this.axis.transform.positionY = 5;

		this.floor = new Floor();

		this.gltf.traverse( ( node: Node ) => {

			if ( node instanceof Batch ) {


				node.shader = new Shader( geometryVertex, geometryFragment );
				node.shader.activate();
				node.shader.setVector2( "cameraPlanes", vec2.fromValues( this.camera.near, this.camera.far ) );
				node.shader.setVector4( "baseColor", vec4.fromValues( Math.random(), Math.random(), Math.random(), 1 ) );

			}

		} );

		this.resize();

	}

	resize() {

		this.bolt.resizeFullScreen();
		this.camera.updateProjection( this.canvas.width / this.canvas.height );
		this.compShader.activate();
		this.compShader.setVector2( "resolution", vec2.fromValues( this.gl.canvas.width, this.gl.canvas.height ) );
		this.post.resize( this.gl.canvas.width, this.gl.canvas.height );
		this.gBuffer.resize( this.gl.canvas.width, this.gl.canvas.height );
		this.gBufferRBO.resize( this.gl.canvas.width, this.gl.canvas.height );

	}

	earlyUpdate( elapsed: number, delta: number ) {

		return;

	}

	drawScene( sceneType = "normal", delta: number ) {

		this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
		this.bolt.clear( 0.9, 0.9, 0.9, 1 );

		this.gltf.traverse( ( node: Node ) => {

			if ( node instanceof Batch ) {

				//node.shader = this.geometryShader;

			}

		} );

		this.bolt.draw( this.gltf );

		if ( sceneType === "geometry" ) {

			// render geo shader here

		} else {

			this.bolt.draw( this.floor );
			this.bolt.draw( this.axis );


		}




	}

	update( elapsed: number, delta: number ) {

		if ( ! this.assetsLoaded ) return;

		this.fpsCamera.update( delta * 0.1 );

		this.bolt.enableDepth();
		this.bolt.enableCullFace();

		this.gBuffer.bind();
		this.drawScene( "geometry", delta );
		this.gBuffer.unbind();

		this.post.begin();
		this.comp.shader.activate();
		this.comp.shader.setTexture( "normal", this.normalTexture );
		this.comp.shader.setTexture( "depth", this.depthTexture );
		this.comp.shader.setTexture( "uv", this.uvTexture );
		this.drawScene( "normal", delta );
		this.post.end();

	}

	lateUpdate( elapsed: number, delta: number ) {

		return;

	}

}
