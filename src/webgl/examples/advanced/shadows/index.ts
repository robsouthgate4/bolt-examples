import Base from "@webgl/Base";
import Bolt, { Program, DrawSet, Node, CameraPersp, Texture2D, Mesh, CameraOrtho, FBO, NONE, FRONT, BACK } from "@bolt-webgl/core";

import matcapVertex from "./shaders/matcap/matcap.vert";
import matcapFragment from "./shaders/matcap/matcap.frag";

import colorVertex from "./shaders/color/color.vert";
import colorFragment from "./shaders/color/color.frag";

import floorVertex from "./shaders/floor/floor.vert";
import floorFragment from "./shaders/floor/floor.frag";

import shadowVertex from "./shaders/shadow/shadow.vert";
import shadowFragment from "./shaders/shadow/shadow.frag";

import { mat4, vec3, vec4, } from "gl-matrix";
import GLTFLoader from "@webgl/modules/gltf-loader";
import Orbit from "@/webgl/modules/Orbit";
import Plane from "@/webgl/modules/primitives/Plane";

export default class extends Base {

	canvas: HTMLCanvasElement;
	camera: CameraPersp;
	assetsLoaded?: boolean;
	bolt = Bolt.getInstance();
	gl: WebGL2RenderingContext;
	root!: Node;
	gltf!: Node;
	orbit: Orbit;
	programEyes: Program;
	programBody: Program;
	matcapTexture!: Texture2D;
	floor!: DrawSet;
	//shadowCamera: CameraOrtho;
	shadowFBO: FBO;
	programShadow: Program;
	programFloor: Program;
	//frustumSize: number;
	lightSpaceMatrix: mat4;
	biasMatrix: mat4;

	constructor() {

		super();
		this.width = window.innerWidth;
		this.height = window.innerHeight;

		this.canvas = <HTMLCanvasElement>document.getElementById( "experience" );
		this.canvas.width = this.width;
		this.canvas.height = this.height;

		this.bolt.init( this.canvas, { antialias: true, dpi: 2 } );

		this.camera = new CameraPersp( {
			aspect: this.canvas.width / this.canvas.height,
			fov: 45,
			near: 0.1,
			far: 1000,
			position: vec3.fromValues( 3, 7, 16 ),
			target: vec3.fromValues( 0, 4, 0 ),
		} );

		const frustumSize = 4;

		const shadowLight = new CameraOrtho( {
			left: - frustumSize,
			right: frustumSize,
			bottom: - frustumSize,
			top: frustumSize,
			near: 0.1,
			far: 35,
			position: vec3.fromValues( - 2, 10, - 1 ),
			target: vec3.fromValues( 0, 0, 0 ),
		} );

		this.lightSpaceMatrix = mat4.create();
		mat4.multiply( this.lightSpaceMatrix, shadowLight.projection, shadowLight.view );

		this.biasMatrix = mat4.fromValues(
			0.5, 0.0, 0.0, 0.0,
			0.0, 0.5, 0.0, 0.0,
			0.0, 0.0, 0.5, 0.0,
			0.5, 0.5, 0.5, 1.0
		);

		this.orbit = new Orbit( this.camera, { maxElevation: Infinity, minElevation: - Infinity } );
		this.bolt.setCamera( this.camera );

		this.shadowFBO = new FBO( { width: 1024, height: 1024, depth: true } );

		this.gl = this.bolt.getContext();

		this.programEyes = new Program( colorVertex, colorFragment );
		this.programEyes.name = "mat_phantom_eyes";

		this.programBody = new Program( matcapVertex, matcapFragment );
		this.programBody.name = "mat_phantom_body";

		this.programFloor = new Program( floorVertex, floorFragment );
		this.programFloor.activate();
		this.programFloor.setTexture( "shadowMap", this.shadowFBO.depthTexture );
		this.programFloor.setMatrix4( "lightSpaceMatrix", this.lightSpaceMatrix );

		this.programShadow = new Program( shadowVertex, shadowFragment );
		this.programShadow.activate();
		this.programShadow.setMatrix4( "lightSpaceMatrix", this.lightSpaceMatrix );

		this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
		this.bolt.enableDepth();

		this.init();


	}

	async init() {

		const gltfLoader = new GLTFLoader( this.bolt );
		this.gltf = await gltfLoader.load( "/static/models/gltf/examples/phantom/PhantomLogoPose2.gltf" );

		this.matcapTexture = new Texture2D( {
			imagePath: "/static/textures/matcap/toon-matcap.jpeg"
		} );

		await this.matcapTexture.load();

		this.assetsLoaded = true;

		this.root = new Node();

		this.gltf.transform.positionY = 3;
		this.gltf.setParent( this.root );

		this.floor = new DrawSet( new Mesh( new Plane() ), this.programFloor );
		this.floor.transform.rotationX = - 90;
		vec3.scale( this.floor.transform.scale, this.floor.transform.scale, 10 );

		this.floor.setParent( this.root );

		this.gltf.traverse( ( node: Node ) => {

			if ( node instanceof DrawSet ) {

				if ( node.program.name === "mat_phantom_body" ) {

					node.name = "phantom_body";

					node.program = this.programBody;
					node.program.activate();
					node.program.setVector4( "baseColor", vec4.fromValues( 1, 1, 1, 1 ) );
					node.program.setTexture( "baseTexture", this.matcapTexture );

				}

				if ( node.program.name === "mat_phantom_eyes" ) {

					node.name = "phantom_eyes";

					node.program = this.programEyes;
					node.program.activate();
					node.program.setVector4( "baseColor", vec4.fromValues( 0, 0, 0, 1 ) );

				}


			}

		} );

		this.resize();

	}

	setDefaultPrograms() {

		// set programs to original

		this.root.traverse( ( node: Node ) => {

			if ( node instanceof DrawSet ) {

				if ( node.name === "phantom_body" ) {

					node.program = this.programBody;

				}

				if ( node.name === "phantom_eyes" ) {

					node.program = this.programEyes;

				}

			}

		} );


		this.floor.program = this.programFloor;

	}

	setShadowPrograms() {

		// set programs to shadow

		this.root.traverse( ( node: Node ) => {

			if ( node instanceof DrawSet ) {

				node.program = this.programShadow;

			}

		} );

	}

	resize() {

		this.bolt.resizeFullScreen();
		this.camera.updateProjection( this.gl.canvas.width / this.gl.canvas.height );
		this.shadowFBO.resize( this.shadowFBO.width, this.shadowFBO.height );

	}

	earlyUpdate( elapsed: number, delta: number ) {

		return;

	}

	update( elapsed: number, delta: number ) {

		if ( ! this.assetsLoaded ) return;

		// draw to shadow map
		{

			this.shadowFBO.bind();

			this.bolt.cullFace( FRONT );

			this.setShadowPrograms();

			this.bolt.clear( 1, 1, 1, 1 );
			this.bolt.draw( this.root );

			this.shadowFBO.unbind();

		}

		// draw scene as normal
		{

			this.bolt.setCamera( this.camera );

			this.bolt.cullFace( BACK );

			this.gltf.transform.rotateY( 0.01 );

			this.orbit.update();

			this.setDefaultPrograms();

			this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
			this.bolt.clear( 0.9, 0.9, 0.9, 1 );

			this.bolt.draw( this.root );

		}


	}

	lateUpdate( elapsed: number, delta: number ): void {

		return;

	}

}
