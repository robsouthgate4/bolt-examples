

import Base from "@webgl/Base";
import Bolt, { Program, Mesh, Transform, DrawSet, Node, CameraPersp } from "@bolt-webgl/core";

import colorVertex from "./shaders/color/color.vert";
import colorFragment from "./shaders/color/color.frag";

import normalVertex from "./shaders/normal/normal.vert";
import normalFragment from "./shaders/normal/normal.frag";


import { vec3, } from "gl-matrix";
import Orbit from "@webgl/modules/orbit";
import { GeometryBuffers } from "@bolt-webgl/core/build/Mesh";
import Floor from "@/webgl/modules/draw-sets/floor";
import Cube from "@/webgl/modules/primitives/Cube";

export default class extends Base {

	canvas: HTMLCanvasElement;
	camera: CameraPersp;
	assetsLoaded?: boolean;
	torusTransform!: Transform;
	sphereDrawSet!: DrawSet;
	cubeDrawSet!: DrawSet;
	planeDrawSet!: DrawSet;
	triangleDrawSet!: DrawSet;
	bolt: Bolt;
	gl: WebGL2RenderingContext;
	root!: Node;
	floorDrawSet: any;
	orbit!: Orbit;

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
			position: vec3.fromValues( 10, 1, 8 ),
			target: vec3.fromValues( 0, 1, 0 ),
		} );

		this.bolt.setCamera( this.camera );
		this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
		this.bolt.enableDepth();

		this.init();


	}

	async init() {

		this.root = new Node();
		this.root.name = "root";

		this.floorDrawSet = new Floor();
		this.floorDrawSet.name = "floor";
		this.floorDrawSet.setParent( this.root );

		// draw a simple quad
		const triangleGeo: GeometryBuffers = {
			positions: [
				- 0.5, 0.5, 0.0,
				- 0.5, - 0.5, 0.0,
				0.5, - 0.5, 0.0,
				0.5, 0.5, 0.0
			],
			indices: [ 0, 1, 2, 0, 2, 3 ]
		};

		const cubeMesh = new Mesh( new Cube() );
		const cubeProgram = new Program( normalVertex, normalFragment );
		const cubeDrawSet = new DrawSet( cubeMesh, cubeProgram );

		cubeDrawSet.transform.position = vec3.fromValues( 0, 3, 6 );
		cubeDrawSet.transform.lookAt( vec3.fromValues( 0, 1.5, 0 ) );

		this.orbit = new Orbit( cubeDrawSet );

		cubeDrawSet.setParent( this.root );

		const triangleMesh = new Mesh( triangleGeo );
		const triProgram = new Program( colorVertex, colorFragment );

		const colours = [
			1, 1, 0,
			0, 1, 1,
			0, 0, 1,
			1, 0, 0
		];

		// attributes can be added with a named var and program
		triangleMesh.addAttribute( new Float32Array( colours ), 3, { program: triProgram, attributeName: "aColor" } );

		this.triangleDrawSet = new DrawSet(
			triangleMesh,
			triProgram
		);

		this.triangleDrawSet.transform.positionY = 1.5;
		this.triangleDrawSet.transform.scale = vec3.fromValues( 3, 3, 3 );

		this.triangleDrawSet.setParent( this.root );

		this.resize();

	}

	resize() {

		this.bolt.resizeFullScreen();
		this.camera.updateProjection( this.canvas.width / this.canvas.height );

	}

	earlyUpdate( elapsed: number, delta: number ) {

		return;

	}

	update( elapsed: number, delta: number ) {


		this.orbit.update();

		this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
		this.bolt.clear( 1, 1, 1, 1 );

		this.bolt.draw( this.root );

	}

	lateUpdate( elapsed: number, delta: number ) {

		return;

	}

}
