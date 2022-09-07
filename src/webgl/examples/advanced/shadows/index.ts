


import Base from "@webgl/Base";
import Bolt, { Program, Mesh, Transform, DrawSet, FBO, CameraPersp } from "@bolt-webgl/core";

import defaultVertex from "./shaders/default/default.vert";
import defaultFragment from "./shaders/default/default.frag";

import { mat4, vec3, } from "gl-matrix";
import CameraArcball from "@webgl/modules/CameraArcball";
import Cube from "@/webgl/modules/primitives/Cube";
import Plane from "@/webgl/modules/primitives/Plane";

// WIP

export default class extends Base {

	canvas: HTMLCanvasElement;
	program: Program;
	lightPosition: vec3;
	camera: CameraPersp;
	assetsLoaded?: boolean;
	torusTransform!: Transform;
	cubeDrawSet!: DrawSet;
	planeDrawSet!: DrawSet;
	bolt: Bolt;
	shadowMapSize!: number;
	depthFBO!: FBO;
	lightProjection: mat4;
	lightView: mat4;
	lightSpaceMatrix: mat4;
	arcball: CameraArcball;

	constructor() {

		super();

		this.width = window.innerWidth;
		this.height = window.innerHeight;

		this.canvas = <HTMLCanvasElement>document.getElementById( "experience" );
		this.canvas.width = this.width;
		this.canvas.height = this.height;

		this.bolt = Bolt.getInstance();
		this.bolt.init( this.canvas, { antialias: true } );

		this.program = new Program( defaultVertex, defaultFragment );
		this.lightPosition = vec3.fromValues( 0, 10, 0 );

		this.camera = new CameraPersp( {
			aspect: this.canvas.width / this.canvas.height,
			fov: 45,
			near: 0.1,
			far: 1000,
			position: vec3.fromValues( 0, 3, 10 ),
			target: vec3.fromValues( 0, 0, 0 ),
		} );

		this.arcball = new CameraArcball( this.camera, 4, 0.08 );

		this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
		this.bolt.setCamera( this.camera );
		this.bolt.enableDepth();

		// shadow mapping

		const nearPlane = 1;
		const farPlane = 7.5;

		this.lightProjection = mat4.create();
		mat4.ortho( this.lightProjection, - 10, 10, - 10, 10, nearPlane, farPlane );

		this.lightView = mat4.create();
		mat4.lookAt( this.lightView, vec3.fromValues( - 2, 4, - 1 ), vec3.fromValues( 0, 0, 0 ), vec3.fromValues( 0, 1, 0 ) );

		this.lightSpaceMatrix = mat4.create();
		mat4.multiply( this.lightSpaceMatrix, this.lightProjection, this.lightView );

		this.shadowMapSize = 1024;
		this.depthFBO = new FBO( { width: this.shadowMapSize, height: this.shadowMapSize, depth: true } );

		this.init();


	}

	async init() {

		const cubeGeometry = new Cube( { widthSegments: 1, heightSegments: 1 } );
		const planeGeometry = new Plane( { widthSegments: 10, heightSegments: 10 } );

		this.cubeDrawSet = new DrawSet(
			new Mesh( cubeGeometry ),
			this.program
		);

		this.cubeDrawSet.transform.position[ 1 ] = 0.5;
		this.cubeDrawSet.transform.rotateY( Math.PI * 0.5 );

		this.planeDrawSet = new DrawSet(
			new Mesh( planeGeometry ),
			this.program
		);

		this.planeDrawSet.transform.rotateX( Math.PI * 0.5 );
		this.planeDrawSet.transform.scale = vec3.fromValues( 10, 10, 10 );

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



		this.arcball.update();

		this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
		this.bolt.clear( 1, 1, 1, 1 );

		this.bolt.draw( this.planeDrawSet );
		this.bolt.draw( this.cubeDrawSet );

	}

	lateUpdate( elapsed: number, delta: number ) {

		return;

	}

}
