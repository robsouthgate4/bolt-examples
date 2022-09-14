

import Base from "@webgl/Base";
import Bolt, { Program, Transform, Mesh, Node, DrawSet, CameraPersp } from "@bolt-webgl/core";

import defaultVertexInstanced from "./shaders/defaultInstanced/defaultInstanced.vert";
import defaultFragmentInstanced from "./shaders/defaultInstanced/defaultInstanced.frag";

import { mat4, quat, vec3, } from "gl-matrix";
import GLTFLoader from "@/webgl/modules/gltf-loader";
import CameraFPS from "@/webgl/modules/camera-fps";

export default class extends Base {

	canvas: HTMLCanvasElement;
	colorProgram: Program;
	lightPosition: vec3;
	camera: CameraPersp;
	assetsLoaded!: boolean;
	cubeTransform!: Transform;
	torusBuffer!: Mesh;
	toruseGLTFBuffer!: Mesh;
	bolt: Bolt;
	arcball: any;
	torusDrawSet!: DrawSet;
	cameraFPS: CameraFPS;
	parent!: Node;

	constructor() {

		super();

		const devicePixelRatio = Math.min( 2, window.devicePixelRatio || 1 );

		this.width = window.innerWidth * devicePixelRatio;
		this.height = window.innerHeight * devicePixelRatio;

		this.canvas = <HTMLCanvasElement>document.getElementById( "experience" );
		this.canvas.width = this.width;
		this.canvas.height = this.height;

		this.camera = new CameraPersp( {
			aspect: this.canvas.width / this.canvas.height,
			fov: 45,
			near: 0.1,
			far: 1000,
			position: vec3.fromValues( 0, 3, 0 ),
			target: vec3.fromValues( 0, 0, 0 ),
		} );

		this.cameraFPS = new CameraFPS( this.camera );

		this.bolt = Bolt.getInstance();
		this.bolt.init( this.canvas, { antialias: true } );
		this.bolt.setCamera( this.camera );

		this.colorProgram = new Program( defaultVertexInstanced, defaultFragmentInstanced );

		this.lightPosition = vec3.fromValues( 0, 10, 0 );

		this.camera.lookAt( vec3.fromValues( 0, 0, - 50 ) );

		this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
		this.bolt.enableDepth();

		this.parent = new Node();


		this.init();


	}

	async init() {

		const instanceCount = 3000;

		const instanceMatrices: mat4[] = [];

		for ( let i = 0; i < instanceCount; i ++ ) {

			const x = ( Math.random() * 2 - 1 ) * 100;
			const y = ( Math.random() * 2 - 1 ) * 20;
			const z = ( Math.random() * 2 - 1 ) * 200;

			const tempTranslation = vec3.fromValues( x, y, - z );

			const tempQuat = quat.create();
			const tempRotation = quat.fromEuler( tempQuat, Math.random() * 360, Math.random() * 360, Math.random() * 360 );
			const tempScale = vec3.fromValues( 1, 1, 1 );

			const translation = mat4.create();
			mat4.fromTranslation( translation, tempTranslation );

			const rotation = mat4.create();
			mat4.fromQuat( rotation, tempRotation );

			const scale = mat4.create();
			mat4.fromScaling( scale, tempScale );

			const combined = mat4.create();
			mat4.multiply( combined, translation, rotation );
			mat4.multiply( combined, combined, scale );

			instanceMatrices.push( combined );

		}

		const gltfLoader = new GLTFLoader( this.bolt );

		const gltf: Node = await gltfLoader.load( "/static/models/gltf/torus.gltf" );

		if ( ! gltf ) return;

		this.assetsLoaded = true;

		gltf.traverse( ( node: Node ) => {

			if ( node.name === "Torus" && node.children.length > 0 ) {

				const batch = <DrawSet>node.children[ 0 ];
				const { positions, normals, uvs, indices } = batch.mesh.buffers;

				this.torusBuffer = new Mesh( {
					positions,
					normals,
					uvs,
					indices,
				}, {
					instanceCount,
					instanced: true,
					instanceMatrices
				} );

			}

		} );



		this.torusDrawSet = new DrawSet( this.torusBuffer, this.colorProgram );
		this.torusDrawSet.setParent( this.parent );

		this.resize();

	}

	resize() {

		this.bolt.resizeFullScreen();
		this.camera.updateProjection( this.canvas.width / this.canvas.height );

	}

	earlyUpdate( elapsed: number, delta: number ) {

		return;

	}

	drawInstances( program: Program, elapsed: number, delta: number ) {

		this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
		this.bolt.clear( 1, 1, 1, 1 );

		this.cameraFPS.update( delta );

		this.torusDrawSet.program.activate();
		this.torusDrawSet.program.setVector3( "viewPosition", this.camera.position );
		this.torusDrawSet.program.setFloat( "time", elapsed );

		this.bolt.draw( this.parent );

	}

	update( elapsed: number, delta: number ) {

		if ( ! this.assetsLoaded ) return;

		this.parent.transform.rotateY( 0.001 );

		this.drawInstances( this.colorProgram, elapsed, delta );


	}

	lateUpdate( elapsed: number, delta: number ) {

		return;

	}

}
