import Base from "@webgl/Base";
import Bolt, { Shader, Node, Batch, TextureCube, CameraPersp, Camera, FBOCube, RBO, Mesh, LINEAR, FRONT } from "@bolt-webgl/core";


import { mat4, quat, vec3, vec4, } from "gl-matrix";
import GLTFLoader from "@/webgl/modules/gltf-loader";
import Floor from "@/webgl/modules/batches/floor";
import reflectionVertex from "./shaders/reflection/reflection.vert";
import reflectionFragment from "./shaders/reflection/reflection.frag";

import colorVertex from "./shaders/color/color.vert";
import colorFragment from "./shaders/color/color.frag";

import skyVertex from "./shaders/sky/sky.vert";
import skyFragment from "./shaders/sky/sky.frag";

import Sphere from "@/webgl/modules/primitives/Sphere";
import Cube from "@/webgl/modules/primitives/Cube";
import { GeometryBuffers } from "@bolt-webgl/core/build/Mesh";

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
	shaderReflection!: Shader;
	cubeMaptexture!: TextureCube;
	cubeCameras: Camera[] = [];
	cubeFBO: FBOCube;
	cubeRBO: RBO;
	cube!: Batch;
	sphere!: Batch;
	cube2!: Batch;
	skyBox: any;
	shaderSky: Shader;
	cameraParent = new Node();
	cameraCubeParent = new Node();
	cameraDebugGeo!: GeometryBuffers;
	cameraDebug2!: Node;

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
			position: vec3.fromValues( 0, 0, 0 )
		} );

		this.cameraParent.transform.position = vec3.fromValues( 0, 3, 10 );
		this.camera.setParent( this.cameraParent );
		this.camera.transform.lookAt( vec3.fromValues( 0, 0, - 1 ) );

		this.bolt = Bolt.getInstance();
		this.bolt.init( this.canvas, { antialias: true, dpi: 2 } );
		this.bolt.setCamera( this.camera );
		this.bolt.enableDepth();

		this.cubeFBO = new FBOCube( { width: 256, height: 256 } );
		this.cubeFBO.bind();
		this.cubeRBO = new RBO( { width: 256, height: 256 } );
		this.cubeFBO.unbind();
		this.cubeRBO.unbind();

		this.shaderReflection = new Shader( reflectionVertex, reflectionFragment );
		this.shaderSky = new Shader( skyVertex, skyFragment );

		this.gl = this.bolt.getContext();

		this.init();

	}

	async init() {

		const gltfLoader = new GLTFLoader( this.bolt );
		const cameraDebugGLTF = await gltfLoader.load( "/static/models/gltf/examples/camera/", "camera.gltf" );
		const cameraDebugBatch = cameraDebugGLTF.children[ 0 ].children[ 0 ] as Batch;

		this.cameraDebugGeo = cameraDebugBatch.mesh.buffers;

		const environmentTexture = new TextureCube( {
			imagePath: "/static/textures/cubeMaps/sky/", files: {
				px: "px.png",
				nx: "nx.png",
				py: "py.png",
				ny: "ny.png",
				pz: "pz.png",
				nz: "nz.png"
			},
			generateMipmaps: true,
			minFilter: LINEAR,
			magFilter: LINEAR
		} );

		await environmentTexture.load();
		this.assetsLoaded = true;

		this.shaderSky.activate();
		this.shaderSky.setTexture( "mapEnvironment", environmentTexture );

		this.shaderReflection.activate();
		this.shaderReflection.setTexture( "mapReflection", this.cubeFBO.targetTexture );

		this.cube = new Batch( new Mesh( new Cube() ), new Shader( colorVertex, colorFragment ) );
		this.cube.transform.position = vec3.fromValues( - 2, 0, 0 );

		this.cube2 = new Batch( new Mesh( new Cube() ), new Shader( colorVertex, colorFragment ) );
		this.cube2.transform.position = vec3.fromValues( 2, 0, 0 );

		this.skyBox = new Batch( new Mesh( new Cube() ), this.shaderSky );
		this.skyBox.transform.position = vec3.fromValues( 0, 0, 0 );
		this.skyBox.transform.scale = vec3.fromValues( 100, 100, 100 );

		this.sphere = new Batch( new Mesh( new Sphere() ), this.shaderReflection );
		this.sphere.transform.position = vec3.fromValues( 0, 0, 0 );
		this.sphere.transform.scale = vec3.fromValues( 1.5, 1.5, 1.5 );

		this.floor = new Floor();

		this.resize();

		this.createCubeCameras();

	}

	resize() {

		this.bolt.resizeFullScreen();
		this.camera.updateProjection( this.canvas.width / this.canvas.height );

	}

	earlyUpdate( elapsed: number, delta: number ) {

		return;

	}

	// setup 6 cameras to render to cube faces
	createCubeCameras() {

		const aspect = 1;
		const fov = 90;
		const near = 0.01;
		const far = 1000;
		const position = vec3.fromValues( 0, 0, 0 );

		const cameraPX = new CameraPersp( {
			aspect,
			fov,
			near,
			far,
			position,
		} );

		cameraPX.transform.lookAt( vec3.fromValues( 1, 0, 0 ), vec3.fromValues( 0, - 1, 0 ) );

		const cameraNX = new CameraPersp( {
			aspect,
			fov,
			near,
			far,
			position,
		} );

		cameraNX.transform.lookAt( vec3.fromValues( - 1, 0, 0 ), vec3.fromValues( 0, - 1, 0 ) );

		const cameraPY = new CameraPersp( {
			aspect,
			fov,
			near,
			far,
			position,
		} );

		cameraPY.transform.lookAt( vec3.fromValues( 0, 1, 0 ), vec3.fromValues( 0, 0, 1 ) );

		const cameraNY = new CameraPersp( {
			aspect,
			fov,
			near,
			far,
			position,
		} );

		cameraNY.transform.lookAt( vec3.fromValues( 0, - 1, 0 ), vec3.fromValues( 0, 0, - 1 ) );

		const cameraPZ = new CameraPersp( {
			aspect,
			fov,
			near,
			far,
			position,
		} );

		cameraPZ.transform.lookAt( vec3.fromValues( 0, 0, 1 ), vec3.fromValues( 0, - 1, 0 ) );

		const cameraNZ = new CameraPersp( {
			aspect,
			fov,
			near,
			far,
			position,
		} );

		cameraNZ.transform.lookAt( vec3.fromValues( 0, 0, - 1 ), vec3.fromValues( 0, - 1, 0 ) );

		this.cubeCameras = [ cameraPX, cameraNX, cameraPY, cameraNY, cameraPZ, cameraNZ ];

		this.cameraCubeParent.transform.y = 0;

		this.cubeCameras.forEach( ( camera ) => {

			const cameraDebugBatch = new Batch( new Mesh( this.cameraDebugGeo ), new Shader( colorVertex, colorFragment ) );

			cameraDebugBatch.transform.quaternion = camera.transform.quaternion;
			cameraDebugBatch.transform.scale = vec3.fromValues( 0.3, 0.3, 0.3 );
			cameraDebugBatch.setParent( this.cameraCubeParent );

			camera.setParent( this.cameraCubeParent );

		} );


	}

	drawScene( elapsed: number ) {

		this.cube.transform.x = - Math.sin( elapsed * 0.75 ) * 2.5;
		this.cube.transform.z = - Math.cos( elapsed * 0.75 ) * 2.5;
		this.cube.transform.lookAt( this.sphere.transform.position );

		this.cube2.transform.x = Math.sin( elapsed * 0.75 ) * 2.5;
		this.cube2.transform.z = Math.cos( elapsed * 0.75 ) * 2.5;
		this.cube2.transform.lookAt( this.sphere.transform.position );

		// combine lookat rotation with looping x rotation

		const r = quat.create();
		quat.setAxisAngle( r, vec3.fromValues( 1, 0, 0 ), elapsed );
		quat.multiply( this.cube2.transform.quaternion, this.cube2.transform.quaternion, r );
		quat.multiply( this.cube.transform.quaternion, this.cube.transform.quaternion, r );

		// draw to cubefbo faces from each camera view

		{

			this.cubeFBO.bind();

			for ( let i = 0; i < 6; i ++ ) {

				this.bolt.disableCullFace();

				this.bolt.setCamera( this.cubeCameras[ i ] );
				this.cubeFBO.setActiveSide( i );
				this.cubeCameras[ i ].update();

				this.bolt.setViewPort( 0, 0, this.cubeFBO.width, this.cubeFBO.height );
				this.bolt.clear( 1, 1, 1, 1 );
				this.bolt.draw( [ this.cube, this.cube2 ] );

				this.bolt.cullFace( FRONT );
				this.bolt.draw( this.skyBox );

			}

			this.cubeFBO.unbind();

		}

		// draw scene as normal

		{

			this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
			this.bolt.clear( 1, 1, 1, 1 );

			this.shaderReflection.activate();
			this.shaderReflection.setVector3( "cameraPosition", this.camera.worldPosition );

			// set the default scene camera
			this.bolt.setCamera( this.camera );

			// draw objects
			this.bolt.draw( [ this.sphere, this.cameraCubeParent, this.cube2, this.cube ] );

			// Draw skybox with just front faces
			this.bolt.cullFace( FRONT );
			this.bolt.draw( this.skyBox );
			this.bolt.disableCullFace();

		}




	}

	update( elapsed: number, delta: number ) {

		if ( ! this.assetsLoaded ) return;

		this.cameraParent.transform.x = Math.sin( elapsed * 0.2 ) * 10;
		this.cameraParent.transform.z = Math.cos( elapsed * 0.2 ) * 10;

		this.cameraParent.updateModelMatrix();
		this.cameraParent.transform.lookAt( vec3.fromValues( 0, 0, 0 ) );
		this.camera.update();

		this.bolt.enableCullFace();
		this.bolt.enableDepth();

		this.drawScene( elapsed );


	}

	lateUpdate( elapsed: number, delta: number ) {

		return;

	}

}
