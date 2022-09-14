

import Base from "@webgl/Base";
import Bolt, { Program, Transform, Mesh, CameraPersp, SRC_ALPHA, ONE_MINUS_SRC_ALPHA, Texture3D, RED, R8, UNSIGNED_BYTE, LINEAR_MIPMAP_LINEAR, LINEAR, REPEAT, BACK, FRONT } from "@bolt-webgl/core";
import vertexShader from "./shaders/raymarch.vert";
import fragmentShader from "./shaders/raymarch.frag";

import { vec3, } from "gl-matrix";
import Orbit from "@webgl/modules/orbit";
import Cube from "@/webgl/modules/primitives/Cube";
import Post from "@/webgl/modules/post";
import FXAAPass from "@/webgl/modules/post/passes/FXAAPass";
import { DrawSet } from "@bolt-webgl/core/";

import { createNoise3D } from "simplex-noise";

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
	orbit!: Orbit;

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
			position: vec3.fromValues( 2, 2, 2 ),
			target: vec3.fromValues( 0, 0, 0 ),
		} );

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

		this.camera.transform.positionX = 3 * Math.sin( elapsed * 0.5 );
		this.camera.transform.positionZ = 3 * Math.cos( elapsed * 0.5 );
		this.camera.lookAt( vec3.fromValues( 0, 0, 0 ) );



		const bgColor = 0 / 255;

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
