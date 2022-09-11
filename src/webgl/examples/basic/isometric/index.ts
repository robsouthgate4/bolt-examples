
import Base from "@webgl/Base";
import Bolt, { Program, Mesh, Transform, DrawSet, Node, TRIANGLES, CameraOrtho } from "@bolt-webgl/core";

import normalVertex from "./shaders/normal/normal.vert";
import normalFragment from "./shaders/normal/normal.frag";

import { vec3, } from "gl-matrix";
import CameraArcball from "@webgl/modules/CameraArcball";
import Cube from "@/webgl/modules/primitives/Cube";
import Floor from "@/webgl/modules/draw-sets/floor";

export default class extends Base {

	canvas: HTMLCanvasElement;
	program: Program;
	camera: CameraOrtho;
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
	arcball: CameraArcball;
	frustumSize: number;

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

		this.frustumSize = 7;
		const aspect = this.canvas.width / this.canvas.height;

		this.camera = new CameraOrtho( {
			left: this.frustumSize * aspect / - 2,
			right: this.frustumSize * aspect / 2,
			bottom: - this.frustumSize / 2,
			top: this.frustumSize / 2,
			near: 0.1,
			far: 1000,
			position: vec3.fromValues( 2, 0.2, 1 ),
			target: vec3.fromValues( 0, 0, 0 )
		} );

		this.arcball = new CameraArcball( this.camera, 4, 0.08 );

		this.bolt.setCamera( this.camera );
		this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
		this.bolt.enableDepth();

		this.init();


	}

	async init() {

		const cubeGeometry = new Cube( { widthSegments: 1, heightSegments: 1 } );

		this.cubeDrawSet = new DrawSet(
			new Mesh( cubeGeometry ).setDrawType( TRIANGLES ),
			this.program
		);

		this.cubeDrawSet.name = "cube";
		this.cubeDrawSet.transform.positionY = 0.75;

		this.floorDrawSet = new Floor();
		this.floorDrawSet.name = "floor";

	}

	resize() {

		this.bolt.resizeFullScreen();

		const aspect = this.canvas.width / this.canvas.height;

		this.camera.left = this.frustumSize * aspect / - 2,
		this.camera.right = this.frustumSize * aspect / 2,
		this.camera.bottom = - this.frustumSize / 2,
		this.camera.top = this.frustumSize / 2,

		this.camera.updateProjection();

	}

	earlyUpdate( elapsed: number, delta: number ) {

		return;

	}

	update( elapsed: number, delta: number ) {


		this.arcball.update();

		this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
		this.bolt.clear( 1, 1, 1, 1 );

		// applied to quaternion
		this.cubeDrawSet.transform.rotateX( 0.5 * delta );
		this.cubeDrawSet.transform.rotateY( 1 * delta );
		this.cubeDrawSet.transform.rotateZ( - 1.5 * delta );

		this.bolt.draw( this.cubeDrawSet );
		this.bolt.draw( this.floorDrawSet );


	}

	lateUpdate( elapsed: number, delta: number ) {

		return;

	}

}
