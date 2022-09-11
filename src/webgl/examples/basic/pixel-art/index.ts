import Base from "@webgl/Base";
import Bolt, { Program, DrawSet, Transform, Node, CameraPersp } from "@bolt-webgl/core";

import colorVertex from "./shaders/color/color.vert";
import colorFragment from "./shaders/color/color.frag";

import { vec3, vec4, } from "gl-matrix";
import CameraArcball from "@webgl/modules/CameraArcball";
import Post from "@/webgl/modules/post";
import FXAAPass from "@/webgl/modules/post/passes/FXAAPass";
import RGBSplitPass from "@/webgl/modules/post/passes/RGBSplitPass";
import PixelatePass from "@/webgl/modules/post/passes/PixelatePass";
import RenderPass from "@/webgl/modules/post/passes/RenderPass";
import Floor from "@/webgl/modules/draw-sets/floor";
import GLTFLoader from "@/webgl/modules/gltf-loader";
export default class extends Base {

	canvas: HTMLCanvasElement;
	programEyes: Program;
	camera: CameraPersp;
	assetsLoaded?: boolean;
	torusTransform!: Transform;
	sphereDrawSet!: DrawSet;
	planeDrawSet!: DrawSet;
	post: Post;
	fxaa!: FXAAPass;
	rbgSplit!: RGBSplitPass;
	renderPass!: RenderPass;
	pixelate!: PixelatePass;
	bolt = Bolt.getInstance();
	gl: WebGL2RenderingContext;
	root!: Node;
	floorDrawSet!: Floor;
	arcball: CameraArcball;
	programBody: Program;
	gltf!: Node;

	constructor() {

		super();

		this.width = window.innerWidth;
		this.height = window.innerHeight;

		this.canvas = <HTMLCanvasElement>document.getElementById( "experience" );
		this.canvas.width = this.width;
		this.canvas.height = this.height;

		this.camera = new CameraPersp( {
			aspect: this.canvas.width / this.canvas.height,
			fov: 45,
			near: 0.1,
			far: 1000,
			position: vec3.fromValues( 2, 7, 10 ),
			target: vec3.fromValues( 0, 3, 0 ),
		} );

		this.arcball = new CameraArcball( this.camera, 4, 0.08 );

		this.bolt.init( this.canvas, { antialias: false, dpi: 2 } );
		this.bolt.setCamera( this.camera );

		this.gl = this.bolt.getContext();

		this.post = new Post( this.bolt );

		this.programEyes = new Program( colorVertex, colorFragment );
		this.programBody = new Program( colorVertex, colorFragment );

		this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
		this.bolt.enableDepth();

		this.init();


	}

	async init() {

		const gltfLoader = new GLTFLoader( this.bolt );
		this.gltf = await gltfLoader.load( "/static/models/gltf/examples/phantom/PhantomLogoPose2.gltf" );
		this.assetsLoaded = true;

		this.pixelate = new PixelatePass( this.bolt, {
			width: this.width,
			height: this.height,
			xPixels: 180,
			yPixels: 180
		} ).setEnabled( true );

		this.fxaa = new FXAAPass( this.bolt, {
			width: this.width,
			height: this.height
		} ).setEnabled( false );

		this.post.add( this.fxaa, false );
		this.post.add( this.pixelate, true );

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
					node.program.setVector4( "baseColor", vec4.fromValues( 0.7, 0.7, 0.7, 1 ) );

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
		this.post.resize( this.gl.canvas.width, this.gl.canvas.height );

	}

	earlyUpdate( elapsed: number, delta: number ) {

		return;

	}

	update( elapsed: number, delta: number ) {

		if ( ! this.assetsLoaded ) return;



		this.post.begin();

		this.programBody.activate();
		this.programBody.setFloat( "time", elapsed );

		this.camera.transform.positionX = 10 * Math.sin( elapsed * 0.5 );
		this.camera.transform.positionZ = 10 * Math.cos( elapsed * 0.5 );
		this.camera.lookAt( vec3.fromValues( 0, 3, 0 ) );

		this.programEyes.activate();
		this.programEyes.setFloat( "time", elapsed );

		this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
		this.bolt.clear( 0.9, 0.9, 0.9, 1 );

		this.bolt.draw( this.root );

		this.post.end();


	}

	lateUpdate( elapsed: number, delta: number ): void {

		return;

	}

}
