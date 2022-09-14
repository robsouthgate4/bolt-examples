

import Base from "@webgl/Base";
import Bolt, { Program, Mesh, Transform, DrawSet, Node, TRIANGLES, CameraPersp } from "@bolt-webgl/core";

import normalVertex from "./shaders/normal/normal.vert";
import normalFragment from "./shaders/normal/normal.frag";

import { vec3, } from "gl-matrix";
import Orbit from "@webgl/modules/orbit";
import Sphere from "@/webgl/modules/primitives/Sphere";
import Cube from "@/webgl/modules/primitives/Cube";
import Floor from "@/webgl/modules/draw-sets/floor";

export default class extends Base {

	canvas: HTMLCanvasElement;
	program: Program;
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
	orbit: Orbit;

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

		this.program = new Program( normalVertex, normalFragment );

		this.camera = new CameraPersp( {
			aspect: this.canvas.width / this.canvas.height,
			fov: 45,
			near: 0.1,
			far: 1000,
			position: vec3.fromValues( 0, 3, 10 ),
			target: vec3.fromValues( 0, 0, 0 ),
		} );

		this.orbit = new Orbit( this.camera );

		this.bolt.setCamera( this.camera );
		this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
		this.bolt.enableDepth();

		this.init();


	}

	async init() {

		const sphereGeometry = new Sphere( { radius: 0.75, widthSegments: 32, heightSegments: 32 } );
		const cubeGeometry = new Cube( { widthSegments: 1, heightSegments: 1 } );

		this.root = new Node();
		this.root.name = "root";
		this.root.transform.positionX = 0;

		this.sphereDrawSet = new DrawSet(
			new Mesh( sphereGeometry ).setDrawType( TRIANGLES ),
			this.program
		);
		this.sphereDrawSet.transform.positionX = - 1.6;
		this.sphereDrawSet.transform.scale = vec3.fromValues( 1.5, 1.5, 1.5 );
		this.sphereDrawSet.name = "sphere";
		this.sphereDrawSet.setParent( this.root );

		this.cubeDrawSet = new DrawSet(
			new Mesh( cubeGeometry ).setDrawType( TRIANGLES ),
			this.program
		);

		this.cubeDrawSet.name = "cube";
		this.cubeDrawSet.transform.scale = vec3.fromValues( 1.5, 1.5, 1.5 );
		this.cubeDrawSet.draw = true;
		this.cubeDrawSet.setParent( this.root );

		this.floorDrawSet = new Floor();
		this.floorDrawSet.name = "floor";
		this.floorDrawSet.setParent( this.root );

		this.cubeDrawSet.transform.positionX = 1.5;

		this.resize();

	}

	resize() {

		this.bolt.resizeFullScreen();

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
