import Base from "@webgl/Base";
import Bolt, { Shader, Batch, Node, CameraPersp, Texture } from "@bolt-webgl/core";

import matcapVertex from "./shaders/matcap/matcap.vert";
import matcapFragment from "./shaders/matcap/matcap.frag";

import colorVertex from "./shaders/color/color.vert";
import colorFragment from "./shaders/color/color.frag";

import { vec3, vec4, } from "gl-matrix";
import CameraArcball from "@webgl/modules/CameraArcball";
import GLTFLoader from "@webgl/modules/gltf-loader";

export default class extends Base {

	canvas: HTMLCanvasElement;
	camera: CameraPersp;
	assetsLoaded?: boolean;
	bolt = Bolt.getInstance();
	gl: WebGL2RenderingContext;
	root!: Node;
	gltf!: Node;
	arcball: CameraArcball;
	shaderEyes: Shader;
	shaderBody: Shader;
	matcapTexture!: Texture;

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
			position: vec3.fromValues( 0, 6, 6 ),
			target: vec3.fromValues( 0, 1, 0 ),
		} );

		this.arcball = new CameraArcball( this.camera, 4, 0.08 );

		this.bolt.init( this.canvas, { antialias: true, dpi: 2 } );
		this.bolt.setCamera( this.camera );

		this.gl = this.bolt.getContext();

		this.shaderEyes = new Shader( colorVertex, colorFragment );
		this.shaderBody = new Shader( matcapVertex, matcapFragment );

		this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
		this.bolt.enableDepth();

		this.init();


	}

	async init() {

		const gltfLoader = new GLTFLoader( this.bolt );
		this.gltf = await gltfLoader.load( "/static/models/gltf/examples/car/", "scene.gltf" );

		this.matcapTexture = new Texture( {
			imagePath: "/static/textures/matcap/matcap.jpeg"
		} );

		await this.matcapTexture.load();

		this.assetsLoaded = true;

		this.root = new Node();

		this.gltf.transform.y = 0;

		this.gltf.traverse( ( node: Node ) => {

			if ( node instanceof Batch ) {

				node.shader = this.shaderBody;
				node.shader.activate();
				node.shader.setVector4( "baseColor", vec4.fromValues( 1, 1, 1, 1 ) );
				node.shader.setTexture( "baseTexture", this.matcapTexture );

			}

		} );

		this.resize();

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

		this.arcball.update();

		this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
		this.bolt.clear( 0.9, 0.9, 0, 1 );

		this.bolt.draw( this.gltf );


	}

	lateUpdate( elapsed: number, delta: number ): void {

		return;

	}

}
