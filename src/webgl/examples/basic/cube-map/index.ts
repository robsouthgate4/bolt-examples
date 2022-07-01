
import CameraArcball from "@/webgl/modules/CameraArcball";
import GLTFLoader from "@/webgl/modules/gltf-loader";

import vertexShader from "../../examples/shaders/cubemap/cubemap.vert";
import fragmentShader from "../../examples/shaders/cubemap/cubemap.frag";

import Base from "@webgl/Base";
import Bolt, { Shader, Node, Batch, CameraPersp, Texture } from "@bolt-webgl/core";
import { vec3, vec4 } from "gl-matrix";

import matcapVertex from "./shaders/matcap/matcap.vert";
import matcapFragment from "./shaders/matcap/matcap.frag";

import colorVertex from "./shaders/color/color.vert";
import colorFragment from "./shaders/color/color.frag";
import Floor from "@/webgl/modules/batches/floor";

export default class extends Base {

	canvas: HTMLCanvasElement;
	bolt: Bolt;
	assetsLoaded = false;
	batch!: Batch;
	camera!: CameraPersp;
	shaderEyes!: Shader;
	shaderBody!: Shader;
	gltf!: Node;
	floor: Floor;

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
    		position: vec3.fromValues( 0, 3, 10 ),
    		target: vec3.fromValues( 0, 0.5, 0 ),
    	} );

    	this.bolt = Bolt.getInstance();
    	this.bolt.init( this.canvas, { antialias: true, dpi: 2 } );
    	this.bolt.setCamera( this.camera );
    	this.bolt.enableDepth();

		this.shaderEyes = new Shader( colorVertex, colorFragment );
		this.shaderBody = new Shader( matcapVertex, matcapFragment );

		this.floor = new Floor();

		this.init();

	}

	async init() {

		const gltfLoader = new GLTFLoader( this.bolt );
    	this.gltf = await gltfLoader.load( "/static/models/gltf/examples/phantom/", "PhantomLogoPose2.gltf" );

    	this.assetsLoaded = true;

		//TODO: switch to use TextureCube class for cubemaps

		// Load cubemap images.
		const nx = await new Texture( { imagePath: "/static/textures/envMap/nx.png" } );
		const ny = await new Texture( { imagePath: "/static/textures/envMap/ny.png" } );
		const nz = await new Texture( { imagePath: "/static/textures/envMap/nz.png" } );
		const px = await new Texture( { imagePath: "/static/textures/envMap/px.png" } );
		const py = await new Texture( { imagePath: "/static/textures/envMap/py.png" } );
		const pz = await new Texture( { imagePath: "/static/textures/envMap/pz.png" } );

		this.gltf.traverse( ( node: Node ) => {

    		if ( node instanceof Batch ) {

    			if ( node.shader.name === "mat_phantom_body" ) {

    				node.shader = this.shaderBody;
    				node.shader.activate();
    				node.shader.setVector4( "baseColor", vec4.fromValues( 0.6, 1.0, 0.75, 1 ) );

    			}

    			if ( node.shader.name === "mat_phantom_eyes" ) {

    				node.shader = this.shaderEyes;
    				node.shader.activate();
    				node.shader.setVector4( "baseColor", vec4.fromValues( 0, 0, 0, 1 ) );

    			}

			}

    	} );


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

		if ( ! this.assetsLoaded ) return;

		this.camera.update();

		this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
		this.bolt.clear( 1, 1, 1, 1 );

		this.bolt.draw( [ this.gltf, this.floor ] );

	}

	lateUpdate( elapsed: number, delta: number ) {

		return;

	}

}
