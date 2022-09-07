

import Base from "@webgl/Base";
import Bolt, { Program, Mesh, DrawSet, CameraPersp, Texture2D, NEAREST } from "@bolt-webgl/core";

import { vec3, } from "gl-matrix";
import CameraArcball from "@webgl/modules/CameraArcball";
import vertexShader from "./shaders/texture/texture.vert";
import fragmentShader from "./shaders/texture/texture.frag";
import Plane from "@/webgl/modules/primitives/Plane";

export default class extends Base {

	canvas: HTMLCanvasElement;
	camera: CameraPersp;
	assetsLoaded?: boolean;
	bolt: Bolt;
	gl: WebGL2RenderingContext;
	arcball: CameraArcball;
	textureDrawSet!: DrawSet;
	planeDrawSet: any;
	dataTexture!: Texture2D;

	constructor() {

		super();

		this.width = window.innerWidth;
		this.height = window.innerHeight;

		this.canvas = <HTMLCanvasElement>document.getElementById( "experience" );
		this.canvas.width = this.width;
		this.canvas.height = this.height;

		this.bolt = Bolt.getInstance();
		this.bolt.init( this.canvas, { antialias: true, dpi: 2 } );

		this.gl = this.bolt.getContext();

		this.camera = new CameraPersp( {
			aspect: this.canvas.width / this.canvas.height,
			fov: 45,
			near: 0.1,
			far: 1000,
			position: vec3.fromValues( 0, 0, 10 ),
			target: vec3.fromValues( 0, 0, 0 ),
		} );

		this.arcball = new CameraArcball( this.camera, 4, 0.08 );

		this.bolt.setCamera( this.camera );
		this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
		this.bolt.enableDepth();

		this.init();


	}

	setData() {

		// generate and draw random colours to canvas
		const width = 64;
		const height = 64;
		const size = width * height;

		const data = new Uint8Array( 4 * size );

		for ( let i = 0; i < size; i ++ ) {

			const r = Math.floor( Math.random() * 255 );
			const g = Math.floor( Math.random() * 255 );
			const b = Math.floor( Math.random() * 255 );

			const stride = i * 4;

			data[ stride ] = r;
			data[ stride + 1 ] = g;
			data[ stride + 2 ] = b;
			data[ stride + 3 ] = 255;

		}

		// draw html canvas to webgl texture
		this.dataTexture.setFromData( data, width, height );

	}

	async init() {

		this.dataTexture = new Texture2D( {
			minFilter: NEAREST,
			magFilter: NEAREST,
		} );

		this.setData();

		const program = new Program( vertexShader, fragmentShader );
		program.activate();
		program.setTexture( "baseTexture", this.dataTexture );

		setInterval( () => {

			this.setData();

		}, 100 );

		this.textureDrawSet = new DrawSet( new Mesh( new Plane( { width: 5, height: 5 } ), ), program );

		this.resize();

	}

	resize() {

		this.bolt.resizeFullScreen();
		this.camera.updateProjection( this.gl.canvas.width / this.gl.canvas.height );

	}

	earlyUpdate( elapsed: number, delta: number ) {

		return;

	}

	update( elapsed: number, delta: number ) {

		this.camera.update();

		this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
		this.bolt.clear( 1, 1, 1, 1 );

		this.bolt.draw( this.textureDrawSet );

	}

	lateUpdate( elapsed: number, delta: number ) {

		return;

	}

}
