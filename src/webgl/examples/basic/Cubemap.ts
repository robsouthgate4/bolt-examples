import Base from "@/webgl/Base";
import CameraArcball from "@/webgl/modules/CameraArcball";
import GLTFLoader from "@/webgl/modules/GLTFLoader";
import { GlTf } from "@/webgl/modules/GLTFLoader/types/GLTF";

import vertexShader from "../../examples/shaders/cubemap/cubemap.vert";
import fragmentShader from "../../examples/shaders/cubemap/cubemap.frag";

import Bolt, { Batch, Mesh, Node, Shader, Texture } from '@robsouthgate/bolt-core';
import { vec3 } from "gl-matrix";

export default class extends Base {
	canvas: HTMLCanvasElement;
	bolt: Bolt;
	camera: CameraArcball;
	gltf!: GlTf;
	assetsLoaded = false;
	shader: Shader;
	batch!: Batch;

	constructor() {
		super();

		this.width = window.innerWidth;
		this.height = window.innerHeight;

		this.canvas = <HTMLCanvasElement>document.getElementById('experience');
		this.canvas.width = this.width;
		this.canvas.height = this.height;

		this.bolt = Bolt.getInstance();
		this.bolt.init(this.canvas, { antialias: true });;

		this.shader = new Shader( vertexShader, fragmentShader );

		this.camera = new CameraArcball(
			this.width,
			this.height,
			vec3.fromValues(0, 0, 10),
			vec3.fromValues(0, 0, 0),
			45,
			0.01,
			1000,
			0.2,
			2
		);

		this.bolt.setCamera(this.camera);
		this.bolt.setViewPort(0, 0, this.canvas.width, this.canvas.height);
		this.bolt.enableDepth();

		this.init();

	}

	async init() {

		const gltfLoader = new GLTFLoader( this.bolt );
		this.gltf = await gltfLoader.loadGLTF( "/static/models/gltf", "phantom.gltf" );
		this.assetsLoaded = true;

		// Load cubemap images.
		const nx = new Texture( this.bolt.getContext(), { imagePath: "/static/textures/envMap/nx.png" });
		const ny = new Texture( this.bolt.getContext(), { imagePath: "/static/textures/envMap/ny.png" });
		const nz = new Texture( this.bolt.getContext(), { imagePath: "/static/textures/envMap/nz.png" });
		const px = new Texture( this.bolt.getContext(), { imagePath: "/static/textures/envMap/px.png" });
		const py = new Texture( this.bolt.getContext(), { imagePath: "/static/textures/envMap/py.png" });
		const pz = new Texture( this.bolt.getContext(), { imagePath: "/static/textures/envMap/pz.png" });

		this.shader.activate();

		this.resize();

	}

	resize() {

		this.bolt.resizeFullScreen();

	}

	earlyUpdate(elapsed: number, delta: number) {
		return;
	}

	update(elapsed: number, delta: number) {

		if( !this.assetsLoaded ) return;

		this.camera.update();

		this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
		this.bolt.clear( 1, 1, 1, 1 );

		this.shader.activate();
		this.shader.setFloat( "time", elapsed );

		if( this.gltf.scenes ) {

			for( const scene of this.gltf.scenes ) {

				scene.root.traverse(( node: Node ) => {

					this.bolt.draw( node );

				})

			}

		}

	}

	lateUpdate(elapsed: number, delta: number) {
		return;
	}

}