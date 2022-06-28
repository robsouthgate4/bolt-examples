

import Base from "@webgl/Base";
import Bolt, { Shader, Node, Batch, TextureCube, CameraPersp, Camera, Texture, FBOCube } from "@bolt-webgl/core";


import { vec3, vec4, } from "gl-matrix";
import CameraArcball from "@webgl/modules/CameraArcball";
import GLTFLoader from "@/webgl/modules/gltf-loader";
import Post from "@/webgl/modules/post";
import Axis from "@/webgl/modules/batches/axis";
import Floor from "@/webgl/modules/batches/floor";
import matcapVertex from "./shaders/matcap/matcap.vert";
import matcapFragment from "./shaders/matcap/matcap.frag";

import colorVertex from "./shaders/color/color.vert";
import colorFragment from "./shaders/color/color.frag";

export default class extends Base {

    canvas: HTMLCanvasElement;
    bodyShader!: Shader;
    eyesShader!: Shader;
    camera: CameraPersp;
    assetsLoaded?: boolean;
    bolt: Bolt;
    gltf!: Node;
    gl: WebGL2RenderingContext;
    floor!: Floor;
	shaderEyes!: Shader;
	shaderBody!: Shader;
	cubeMaptexture!: TextureCube;
	cubeCameras: Camera[] = [];
	cubeTexture: TextureCube;
	cubeFBO: FBOCube;

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

		this.cubeTexture = new TextureCube();
		this.cubeFBO = new FBOCube();

		this.shaderEyes = new Shader( colorVertex, colorFragment );
		this.shaderBody = new Shader( matcapVertex, matcapFragment );

		this.shaderBody.activate();
		this.shaderBody.setTexture( "mapReflection", this.cubeTexture );

    	this.gl = this.bolt.getContext();

		this.createCubeCameras();
    	this.init();


	}

	async init() {

    	const gltfLoader = new GLTFLoader( this.bolt );
    	this.gltf = await gltfLoader.load( "/static/models/gltf/examples/phantom/", "PhantomLogoPose2.gltf" );

    	this.assetsLoaded = true;

		this.gltf.traverse( ( node: Node ) => {

    		if ( node instanceof Batch ) {

    			if ( node.shader.name === "mat_phantom_body" ) {

    				node.shader = this.shaderBody;
    				node.shader.activate();
    				node.shader.setVector4( "baseColor", vec4.fromValues( 1, 1, 1, 1 ) );

    			}

    			if ( node.shader.name === "mat_phantom_eyes" ) {

    				node.shader = this.shaderEyes;
    				node.shader.activate();
    				node.shader.setVector4( "baseColor", vec4.fromValues( 0, 0, 0, 1 ) );

    			}

			}

    	} );

    	this.floor = new Floor();

    	this.resize();

	}

	resize() {

    	this.bolt.resizeFullScreen();
    	this.camera.updateProjection( this.canvas.width / this.canvas.height );

	}

	earlyUpdate( elapsed: number, delta: number ) {

    	return;

	}

	createCubeCameras() {

		const aspect = this.canvas.width / this.canvas.height;
		const fov = 90;
		const near = 0.1;
		const far = 1000;
		const position = vec3.fromValues( 0, 0, 0 );

		const cameraPX = new CameraPersp( {
			aspect,
    		fov,
    		near,
    		far,
    		position,
    		target: vec3.fromValues( 1, 0, 0 ),
    	} );

		cameraPX.up = vec3.fromValues( 0, 1, 0 );

		const cameraNX = new CameraPersp( {
			aspect,
    		fov,
    		near,
    		far,
    		position,
    		target: vec3.fromValues( - 1, 0, 0 ),
    	} );

		cameraNX.up = vec3.fromValues( 0, - 1, 0 );

		const cameraPY = new CameraPersp( {
			aspect,
    		fov,
    		near,
    		far,
    		position,
    		target: vec3.fromValues( 0, 1, 0 ),
    	} );

		cameraPY.up = vec3.fromValues( 0, 0, 1 );

		const cameraNY = new CameraPersp( {
			aspect,
    		fov,
    		near,
    		far,
    		position,
    		target: vec3.fromValues( 0, - 1, 0 ),
    	} );

		cameraNY.up = vec3.fromValues( 0, 0, - 1 );

		const cameraPZ = new CameraPersp( {
			aspect,
    		fov,
    		near,
    		far,
    		position,
    		target: vec3.fromValues( 0, 0, 1 ),
    	} );

		cameraPZ.up = vec3.fromValues( 0, - 1, 0 );

		const cameraNZ = new CameraPersp( {
			aspect,
			fov,
			near,
			far,
			position,
			target: vec3.fromValues( 0, 0, - 1 ),
		} );

		cameraNZ.up = vec3.fromValues( 0, - 1, 0 );

		this.cubeCameras = [ cameraPX, cameraNX, cameraPY, cameraNY, cameraPZ, cameraNZ ];

	}

	drawScene( ) {

    	this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
    	this.bolt.clear( 0.9, 0.9, 0.9, 1 );

    	this.gltf.transform.position = vec3.fromValues( 0, 0, 0 );

		this.cubeCameras[ 0 ].update();
		this.bolt.setCamera( this.cubeCameras[ 0 ] );

    	this.bolt.draw( [ this.floor, this.gltf ] );


	}

	update( elapsed: number, delta: number ) {

    	if ( ! this.assetsLoaded ) return;

    	this.camera.update();

    	this.bolt.enableDepth();
    	this.bolt.enableCullFace();

    	this.drawScene();


	}

	lateUpdate( elapsed: number, delta: number ) {

    	return;

	}

}
