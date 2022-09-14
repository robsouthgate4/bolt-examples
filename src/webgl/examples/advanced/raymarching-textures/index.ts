

import Base from "@webgl/Base";
import Bolt, { Program, Transform, Mesh, Texture2D, CameraPersp, CLAMP_TO_EDGE, LINEAR, SRC_ALPHA, ONE_MINUS_SRC_ALPHA, FRONT, BACK } from "@bolt-webgl/core";
import vertexShader from "./shaders/raymarch.vert";
import fragmentShader from "./shaders/raymarch.frag";

import { vec3, } from "gl-matrix";
import Orbit from "@webgl/modules/orbit";
import Cube from "@/webgl/modules/primitives/Cube";
import Post from "@/webgl/modules/post";
import FXAAPass from "@/webgl/modules/post/passes/FXAAPass";
import { DrawSet } from "@bolt-webgl/core/";

export default class extends Base {

	canvas: HTMLCanvasElement;
	program: Program;
	lightPosition: vec3;
	camera: CameraPersp;
	assetsLoaded!: boolean;
	torusTransform!: Transform;
	cubeDrawSet!: DrawSet;
	bolt: Bolt;
	post: Post;
	orbit: Orbit;

	constructor() {

		super();

		this.width = window.innerWidth;
		this.height = window.innerHeight;

		this.canvas = <HTMLCanvasElement>document.getElementById( "experience" );
		this.canvas.width = this.width;
		this.canvas.height = this.height;

		this.bolt = Bolt.getInstance();
		this.bolt.init( this.canvas, { antialias: true, powerPreference: "high-performance" } );

		this.program = new Program( vertexShader, fragmentShader );
		this.lightPosition = vec3.fromValues( 0, 10, 0 );

		this.camera = new CameraPersp( {
			aspect: this.canvas.width / this.canvas.height,
			fov: 45,
			near: 0.1,
			far: 1000,
			position: vec3.fromValues( 2, 0, 2 ),
			target: vec3.fromValues( 0, 0, 0 ),
		} );

		this.orbit = new Orbit( this.camera );

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

		const geometry = new Cube( { widthSegments: 1, heightSegments: 1, depthSegments: 1 } );

		const volumeTexture = new Texture2D( {
			imagePath: "/static/textures/volumes/volume-rubber.png",
			wrapS: CLAMP_TO_EDGE,
			wrapT: CLAMP_TO_EDGE,
			minFilter: LINEAR,
			magFilter: LINEAR,
			generateMipmaps: false,
		} );

		await volumeTexture.load();


		this.assetsLoaded = true;

		this.program.activate();
		this.program.setTexture( "mapVolume", volumeTexture );
		this.program.transparent = true;
		this.program.blendFunction = { src: SRC_ALPHA, dst: ONE_MINUS_SRC_ALPHA };

		// setup nodes
		this.cubeDrawSet = new DrawSet(
			new Mesh( geometry ),
			this.program
		);

		this.resize();

	}

	resize() {

		this.bolt.resizeFullScreen();
		this.camera.updateProjection( this.canvas.width / this.canvas.height );
		this.post.resize( this.canvas.width, this.canvas.height );

	}

	earlyUpdate( elapsed: number, delta: number ) {

		return;

	}

	update( elapsed: number, delta: number ) {

		if ( ! this.assetsLoaded ) return;

		this.post.begin();
		this.orbit.update();

		this.bolt.enableCullFace();
		this.bolt.cullFace( BACK );

		const bgColor = 211 / 255;

		this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
		this.bolt.clear( bgColor, bgColor, bgColor, 1 );

		this.program.activate();
		this.program.setVector3( "viewPosition", this.camera.position );
		this.program.setFloat( "time", elapsed );

		this.bolt.draw( this.cubeDrawSet );

		this.post.end();

	}

	lateUpdate( elapsed: number, delta: number ) {

		return;

	}

}
