

import Base from "@webgl/Base";
import Bolt, { Shader, Transform, Mesh, CameraPersp, SRC_ALPHA, ONE_MINUS_SRC_ALPHA, Texture3D, RED, R8, UNSIGNED_BYTE, LINEAR_MIPMAP_LINEAR, LINEAR, REPEAT, BACK, FRONT } from "@bolt-webgl/core";
import vertexShader from "./shaders/raymarch.vert";
import fragmentShader from "./shaders/raymarch.frag";

import { vec3, } from "gl-matrix";
import CameraArcball from "@webgl/modules/CameraArcball";
import Cube from "@/webgl/modules/primitives/Cube";
import Post from "@/webgl/modules/post";
import FXAAPass from "@/webgl/modules/post/passes/FXAAPass";
import { Batch } from "@bolt-webgl/core/";

import { createNoise3D } from "simplex-noise";

export default class extends Base {

	canvas: HTMLCanvasElement;
	shader: Shader;
	lightPosition: vec3;
	camera: CameraPersp;
	assetsLoaded!: boolean;
	torusTransform!: Transform;
	cubeBatch!: Batch;
	bolt: Bolt;
	post: Post;
	arcball: CameraArcball;

	constructor() {

		super();

		this.width = window.innerWidth;
		this.height = window.innerHeight;

		this.canvas = <HTMLCanvasElement>document.getElementById( "experience" );
		this.canvas.width = this.width;
		this.canvas.height = this.height;

		this.bolt = Bolt.getInstance();
		this.bolt.init( this.canvas, { antialias: true, powerPreference: "high-performance" } );

		this.shader = new Shader( vertexShader, fragmentShader );
		this.lightPosition = vec3.fromValues( 0, 10, 0 );

		this.camera = new CameraPersp( {
			aspect: this.canvas.width / this.canvas.height,
			fov: 45,
			near: 0.1,
			far: 1000,
			position: vec3.fromValues( 2, 0, 2 ),
			target: vec3.fromValues( 0, 0, 0 ),
		} );

		this.arcball = new CameraArcball( this.camera, 4, 0.08 );

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

		const SIZE = 32;

		const volumeTexture = new Texture3D( {
			width: SIZE,
			height: SIZE,
			depth: SIZE,
			format: RED,
			internalFormat: R8,
			type: UNSIGNED_BYTE,
			minFilter: LINEAR_MIPMAP_LINEAR,
			magFilter: LINEAR,
			wrapS: REPEAT,
			wrapT: REPEAT,
			baseLevel: 0,
			maxLevel: Math.log2( SIZE ),
		} );

		const data = new Uint8Array( SIZE * SIZE * SIZE );

		const noise3D = createNoise3D();

		let x = 0;

		for ( let k = 0; k < SIZE; ++ k ) {

			for ( let j = 0; j < SIZE; ++ j ) {

				for ( let i = 0; i < SIZE; ++ i ) {

					data[ x ] = ( SIZE + SIZE * noise3D( i * 0.1, j * 0.1, k * 0.1 ) );

					x ++;

				}

			}

		}

		volumeTexture.setFromData( data, SIZE, SIZE, SIZE );

		this.assetsLoaded = true;

		this.shader.activate();
		this.shader.setTexture( "mapVolume", volumeTexture );
		this.shader.transparent = true;
		this.shader.blendFunction = { src: SRC_ALPHA, dst: ONE_MINUS_SRC_ALPHA };

		// setup nodes
		this.cubeBatch = new Batch(
			new Mesh( geometry ),
			this.shader
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

		this.bolt.enableCullFace();
		this.bolt.cullFace( FRONT );


		this.post.begin();
		this.arcball.update();

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
