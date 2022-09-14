
import Base from "@webgl/Base";
import Bolt, { Program, Mesh, Transform, DrawSet, Node, TRIANGLES, CameraPersp } from "@bolt-webgl/core";

import defaultVertex from "./shaders/default/default.vert";
import defaultFragment from "./shaders/default/default.frag";

import { vec3 } from "gl-matrix";
import Orbit from "@webgl/modules/orbit";
import Cube from "@/webgl/modules/primitives/Cube";

export default class extends Base {

	canvas: HTMLCanvasElement;
	program: Program;
	camera: CameraPersp;
	orbit: Orbit;
	assetsLoaded?: boolean;
	torusTransform!: Transform;
	sphereDrawSet!: DrawSet;
	cubeDrawSet!: DrawSet;
	planeDrawSet!: DrawSet;
	triangleDrawSet!: DrawSet;
	bolt: Bolt;
	root!: Node;
	viewport!: { height: number; width: number; };
	gl: WebGL2RenderingContext;
	batches: DrawSet[] = [];

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

		this.program = new Program( defaultVertex, defaultFragment );

		this.camera = new CameraPersp( {
			aspect: this.canvas.width / this.canvas.height,
			fov: 45,
			near: 0.1,
			far: 1000,
			position: vec3.fromValues( 6, 6, 10 ),
			target: vec3.fromValues( 0, 1, 0 ),
		} );

		this.orbit = new Orbit( this.camera );

		this.camera.lookAt( vec3.fromValues( 0, 0, 0 ) );

		this.bolt.setCamera( this.camera );
		this.bolt.enableDepth();

		this.init();

		this.resize();

	}

	generateViewport() {

		const fov = this.camera.fov;
		const height = 2 * Math.tan( fov / 2 ) * ( this.camera.position[ 2 ] );
		const width = height * this.camera.aspect;

		return {
			height,
			width,
		};

	}

	async init() {

		const vp = this.generateViewport();

		const planeGeometry = new Cube( { width: 1, height: 1, depth: 1 } );

		this.root = new Node();

		const mesh = new Mesh( planeGeometry ).setDrawType( TRIANGLES );

		this.planeDrawSet = new DrawSet(
			mesh,
			this.program
		);

		const count = 5;

		for ( let index = 0; index < count; index ++ ) {

			const batch = new DrawSet(
				mesh,
				this.program
			);

			//batch.transform.positionX = ( index * 2.5 ) - count;

			batch.transform.scaleX = vp.width * 0.5;
			batch.transform.scaleY = vp.height * 0.5;

			this.batches.push( batch );

			batch.setParent( this.root );

		}

		this.resize();

	}

	resize() {

		this.bolt.resizeFullScreen();
		this.camera.updateProjection( this.canvas.width / this.canvas.height );

		const vp = this.generateViewport();

		// now resize all batches

	}

	earlyUpdate( elapsed: number, delta: number ) {

		return;

	}

	update( elapsed: number, delta: number ) {


		this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
		this.bolt.clear( 0, 0, 0, 1 );

		this.bolt.draw( this.root );

	}

	lateUpdate( elapsed: number, delta: number ) {

		return;

	}

}
