import Base from "@webgl/Base";
import Bolt, { Program, DrawSet, Transform, Node, CameraPersp, FBO, Mesh, RBO } from "@bolt-webgl/core";

import colorVertex from "./shaders/color/color.vert";
import colorFragment from "./shaders/color/color.frag";

import compositionVertex from "./shaders/composition/composition.vert";
import compositionFragment from "./shaders/composition/composition.frag";

import { vec2, vec3, vec4, } from "gl-matrix";
import Post from "@/webgl/modules/post";
import Floor from "@/webgl/modules/draw-sets/floor";
import GLTFLoader from "@/webgl/modules/gltf-loader";
import CameraFPS from "@webgl/modules/camera-fps";

export default class extends Base {

	canvas: HTMLCanvasElement;
	programEyes: Program;
	camera: CameraPersp;
	assetsLoaded?: boolean;
	torusTransform!: Transform;
	sphereDrawSet!: DrawSet;
	planeDrawSet!: DrawSet;
	post: Post;
	bolt = Bolt.getInstance();
	gl: WebGL2RenderingContext;
	root!: Node;
	floorDrawSet!: Floor;
	cameraFPS: CameraFPS;
	programBody: Program;
	gltf!: Node;
	depthFBO!: FBO;
	fullScreenTriangle!: Mesh;
	compProgram!: Program;
	depthRBO!: RBO;
	screenDrawSet!: DrawSet;
	cubeDrawSet!: DrawSet;

	constructor() {

		super();

		this.width = window.innerWidth;
		this.height = window.innerHeight;

		this.canvas = <HTMLCanvasElement>document.getElementById( "experience" );
		this.canvas.width = this.width;
		this.canvas.height = this.height;

		this.camera = new CameraPersp( {
			aspect: this.canvas.width / this.canvas.height,
			fov: 70,
			near: 0.01,
			far: 20,
			position: vec3.fromValues( 0, 3, 6 ),
			target: vec3.fromValues( 0, 3, 0 ),
		} );

		this.cameraFPS = new CameraFPS( this.camera );

		this.bolt.init( this.canvas, { antialias: false, dpi: 2 } );
		this.bolt.setCamera( this.camera );

		this.gl = this.bolt.getContext();

		this.post = new Post( this.bolt );

		this.compProgram = new Program( compositionVertex, compositionFragment );
		this.compProgram.activate();
		this.compProgram.setVector2( "cameraPlanes", vec2.fromValues( this.camera.near, this.camera.far ) );

		this.programEyes = new Program( colorVertex, colorFragment );
		this.programBody = new Program( colorVertex, colorFragment );

		this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
		this.bolt.enableDepth();

		this.init();


	}

	async init() {

		this.depthFBO = new FBO( { width: this.canvas.width, height: this.canvas.height, depth: true } );

		const triangleVertices = [
			- 1, - 1, 0, - 1, 4, 0, 4, - 1, 0
		];

		const triangleIndices = [
			2, 1, 0
		];

		this.fullScreenTriangle = new Mesh( {
			positions: triangleVertices,
			indices: triangleIndices
		} );

		this.screenDrawSet = new DrawSet( this.fullScreenTriangle, this.compProgram );

		const gltfLoader = new GLTFLoader( this.bolt );
		this.gltf = await gltfLoader.load( "/static/models/gltf/examples/phantom/PhantomLogoPose2.gltf" );

		this.assetsLoaded = true;

		this.root = new Node();
		this.floorDrawSet = new Floor();
		this.floorDrawSet.setParent( this.root );

		this.gltf.transform.positionY = 2;
		this.gltf.setParent( this.root );

		this.gltf.traverse( ( node: Node ) => {

			if ( node instanceof DrawSet ) {

				if ( node.program.name === "mat_phantom_body" ) {

					node.program = this.programBody;
					node.program.activate();
					node.program.setVector4( "baseColor", vec4.fromValues( 0, 1, 1, 1 ) );

				}

				if ( node.program.name === "mat_phantom_eyes" ) {

					node.program = this.programEyes;
					node.program.activate();
					node.program.setVector4( "baseColor", vec4.fromValues( 0, 0, 0, 1 ) );

				}


			}

		} );

		this.resize();

	}

	resize() {

		this.bolt.resizeFullScreen();
		this.camera.updateProjection( this.gl.canvas.width / this.gl.canvas.height );
		this.depthFBO.resize( this.gl.canvas.width, this.gl.canvas.height );

	}

	earlyUpdate( elapsed: number, delta: number ) {

		return;

	}

	update( elapsed: number, delta: number ) {

		if ( ! this.assetsLoaded ) return;

		this.cameraFPS.update( delta );


		this.depthFBO.bind();
		this.bolt.clear( 0.9, 0.9, 0.9, 1 );
		this.bolt.draw( this.root );
		this.depthFBO.unbind();

		this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
		this.compProgram.activate();
		this.compProgram.setTexture( "map", this.depthFBO.targetTexture );
		this.compProgram.setTexture( "mapDepth", this.depthFBO.depthTexture! );

		this.fullScreenTriangle.draw( this.compProgram );


	}

	lateUpdate( elapsed: number, delta: number ): void {

		return;

	}

}
