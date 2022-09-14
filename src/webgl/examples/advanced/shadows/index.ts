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
import ShadowMapper from "@/webgl/modules/shadow-mapper";

export default class extends Base {

	canvas: HTMLCanvasElement;
	camera: CameraPersp;
	assetsLoaded?: boolean;
	bolt = Bolt.getInstance();
	gl: WebGL2RenderingContext;
	phantomRoot = new Node();
	structureRoot = new Node();
	gltf!: Node;
	orbit: Orbit;
	programEyes: Program;
	programBody: Program;
	matcapTexture!: Texture2D;
	floor!: DrawSet;
	wallBack!: DrawSet;
	wallRight!: DrawSet;
	shadowFBO: FBO;
	programShadow: Program;
	programSurface: Program;
	lightSpaceMatrix: mat4;
	shadowLight: CameraOrtho;
	shadowMapper: ShadowMapper;

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
			position: vec3.fromValues( - 12, 7, 13 ),
			target: vec3.fromValues( 0, 4, 0 ),
		} );

		const frustumSize = 7;

		this.shadowLight = new CameraOrtho( {
			left: - frustumSize,
			right: frustumSize,
			bottom: - frustumSize,
			top: frustumSize,
			near: 0.1,
			far: 20,
			position: vec3.fromValues( - 10, 8, 2 ),
			target: vec3.fromValues( 0, 0, 0 ),
		} );

		this.lightSpaceMatrix = mat4.create();
		mat4.multiply( this.lightSpaceMatrix, this.shadowLight.projection, this.shadowLight.view );

		this.orbit = new Orbit( this.camera, { maxElevation: Infinity, minElevation: - Infinity } );
		this.bolt.setCamera( this.camera );

		this.shadowFBO = new FBO( { width: 1024, height: 1024, depth: true } );

		this.gl = this.bolt.getContext();

		this.programEyes = new Program( colorVertex, colorFragment );
		this.programEyes.name = "mat_phantom_eyes";

		this.programBody = new Program( matcapVertex, matcapFragment );
		this.programBody.name = "mat_phantom_body";
		this.programBody.activate();
		this.programBody.setVector3( "lightPosition", this.shadowLight.position );

		this.programSurface = new Program( floorVertex, floorFragment );
		this.programSurface.activate();
		this.programSurface.setFloat( "shadowStrength", 0.1 );

		this.programShadow = new Program( shadowVertex, shadowFragment );
		this.programShadow.activate();
		this.programShadow.setMatrix4( "lightSpaceMatrix", this.lightSpaceMatrix );

		this.shadowMapper = new ShadowMapper( {
			bolt: this.bolt,
			light: this.shadowLight,
			width: 1024,
			height: 1024
		} );

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

		this.createStructure();

		this.gltf.traverse( ( node: Node ) => {

			this.assignPrograms( node );

		} );

		this.shadowMapper.add( this.phantomRoot );

		this.resize();

	}

	assignPrograms( node: Node ) {

		if ( node instanceof DrawSet ) {

			if ( node.program.name === "mat_phantom_body" ) {

				node.name = "phantom_body";

				node.program = this.programBody;
				node.program.activate();
				node.program.setVector4( "baseColor", vec4.fromValues( 1, 1, 1, 1 ) );
				node.program.setTexture( "baseTexture", this.matcapTexture );
				node.program.setFloat( "shadowStrength", 0.1 );

				node.setParent( this.phantomRoot );

			}

			if ( node.program.name === "mat_phantom_eyes" ) {

				node.name = "phantom_eyes";

				node.program = this.programEyes;
				node.program.activate();
				node.program.setVector4( "baseColor", vec4.fromValues( 0, 0, 0, 1 ) );
				node.program.setFloat( "shadowStrength", 0.1 );

				node.setParent( this.phantomRoot );

			}

		}

	}

	createStructure() {

		const structureScale = 10;

		this.floor = new DrawSet( new Mesh( new Plane() ), this.programSurface );
		this.floor.transform.rotationX = - 90;
		vec3.scale( this.floor.transform.scale, this.floor.transform.scale, structureScale );
		this.floor.setParent( this.structureRoot );

		this.wallBack = new DrawSet( new Mesh( new Plane() ), this.programSurface );
		this.wallBack.transform.positionZ = - structureScale * 0.5;
		this.wallBack.transform.positionY = structureScale * 0.5;
		vec3.scale( this.wallBack.transform.scale, this.wallBack.transform.scale, structureScale );
		this.wallBack.setParent( this.structureRoot );

		this.wallRight = new DrawSet( new Mesh( new Plane() ), this.programSurface );
		this.wallRight.transform.positionY = structureScale * 0.5;
		this.wallRight.transform.positionX = structureScale * 0.5;
		this.wallRight.transform.rotationY = - 90;
		vec3.scale( this.wallRight.transform.scale, this.wallRight.transform.scale, structureScale );
		this.wallRight.setParent( this.structureRoot );

		this.shadowMapper.add( this.structureRoot );

	}

	resize() {

		this.bolt.resizeFullScreen();
		this.camera.updateProjection( this.gl.canvas.width / this.gl.canvas.height );

	}

	earlyUpdate( elapsed: number, delta: number ) {

		return;

	}

	update( elapsed: number, delta: number ) {

		if ( ! this.assetsLoaded ) return;

		this.orbit.update();

		this.phantomRoot.transform.positionY = 4 + Math.sin( elapsed * 1 ) * 0.5;
		this.phantomRoot.transform.rotateY( delta );

		this.shadowMapper.draw( this.phantomRoot );

		// draw scene as normal
		{

			this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
			this.bolt.clear( 0.9, 0.9, 0.9, 1 );

			this.bolt.draw( this.phantomRoot );
			this.bolt.draw( this.structureRoot );

		}


	}

	lateUpdate( elapsed: number, delta: number ): void {

		return;

	}

}
