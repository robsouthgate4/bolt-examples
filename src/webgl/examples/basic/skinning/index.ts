
import Base from "@webgl/Base";
import Bolt, { BACK, CameraPersp, FRONT, Node, } from "@bolt-webgl/core";

import { quat, vec3 } from "gl-matrix";
import Orbit from "@webgl/modules/orbit";
import Floor from "@/webgl/modules/draw-sets/floor";
import GLTFLoader from "@/webgl/modules/gltf-loader";

export default class extends Base {

	canvas: HTMLCanvasElement;
	lightPosition: vec3;
	camera: CameraPersp;
	assetsLoaded?: boolean;
	sphereNode!: Node;
	planeNode!: Node;
	bolt: Bolt;
	gltf!: Node;
	floor: Floor;
	orbit: Orbit;
	_neckNode?: Node;

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
			position: vec3.fromValues( 0, 3, 8 ),
			target: vec3.fromValues( 0, 2, 0 ),
		} );

		this.orbit = new Orbit( this.camera );

		this.bolt = Bolt.getInstance();
		this.bolt.init( this.canvas, { antialias: true, dpi: 2, powerPreference: "high-performance" } );
		this.bolt.setCamera( this.camera );

		this.floor = new Floor();

		this.lightPosition = vec3.fromValues( 0, 0, 2 );

		this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
		this.bolt.enableDepth();

		this.bolt.enableCullFace();
		this.bolt.cullFace( BACK );

		this.init();


	}

	async init() {

		const gltfLoader = new GLTFLoader( this.bolt );

		this.gltf = await gltfLoader.load( "/static/models/gltf/examples/tony-stark/scene-v2.glb" );
		this.gltf.transform.position = vec3.fromValues( 0, 0, 0 );

		this.gltf.traverse( ( node: Node ) => {

			if ( node.name === "Neck" ) {

				this._neckNode = node;

			}

		} );

		this.assetsLoaded = true;

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

		this.orbit.update();
		this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
		this.bolt.clear( 1, 1, 1, 1 );

		if ( this._neckNode ) {

			const yQuat = quat.create();
			const angle = Math.sin( elapsed * 10 ) * 0.0075;
			quat.setAxisAngle( yQuat, vec3.fromValues( 0, 1, 0 ), angle );
			quat.multiply( yQuat, this._neckNode.transform.quaternion, yQuat );
			this._neckNode.transform.quaternion = yQuat;

		}

		this.bolt.draw( this.gltf );

	}

	lateUpdate( elapsed: number, delta: number ) {

		return;

	}

}
