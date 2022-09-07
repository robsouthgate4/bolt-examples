
import Base from "@webgl/Base";
import Bolt, { DrawSet, CameraPersp, Node, Transform } from "@bolt-webgl/core";

import { quat, vec2, vec3 } from "gl-matrix";
import Floor from "@/webgl/modules/draw-sets/floor";
import GLTFLoader from "@/webgl/modules/gltf-loader";
import Orbit from "@/webgl/modules/Orbit";

/**
 * TODO: INCOMPLETE
 */

export default class extends Base {

	canvas: HTMLCanvasElement;
	lightPosition: vec3;
	camera: CameraPersp;
	assetsLoaded?: boolean;
	torusTransform!: Transform;
	sphereNode!: Node;
	planeNode!: Node;
	bolt: Bolt;
	gltf!: Node;
	floor: Floor;
	_mouseDown = false;
	_mouse = vec2.fromValues( 0, 0 );
	_rotationX = quat.create();
	_rotationY = quat.create();
	_rotation = quat.create();
	orbit: Orbit;

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
			position: vec3.fromValues( 4, 5, 8 ),
			target: vec3.fromValues( 0, 2, 0 ),
		} );

		this.orbit = new Orbit( this.camera );

		this.bolt = Bolt.getInstance();
		this.bolt.init( this.canvas, { antialias: true, dpi: 2 } );
		this.bolt.setCamera( this.camera );

		this.floor = new Floor();

		this.lightPosition = vec3.fromValues( 0, 0, 2 );

		this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
		this.bolt.enableDepth();
		this.bolt.disableCullFace();

		window.addEventListener( "mousemove", ( e ) => {

			this._mouseDown = true;

			this._mouse[ 0 ] = e.clientX / this.canvas.width * 2 - 1;
			this._mouse[ 1 ] = 1 - e.clientY / this.canvas.height * 2 - 1;

		} );

		window.addEventListener( "mouseup", ( e ) => {

			this._mouseDown = false;

		} );

		this.init();


	}

	async init() {

		const gltfLoader = new GLTFLoader( this.bolt );

		this.gltf = await gltfLoader.load( "/static/models/gltf/examples/character/scene.glb" );
		this.gltf.transform.scale = vec3.fromValues( 0.5, 0.5, 0.5 );

		this.gltf.traverse( ( node: Node ) => {

			if ( node instanceof DrawSet ) {

				console.log( node );

			}

		} );

		this.assetsLoaded = true;

		this.resize();

	}

	resize() {

		this.bolt.resizeFullScreen();
		this.camera.updateProjection( this.canvas.clientWidth / this.canvas.clientHeight );

	}

	earlyUpdate( elapsed: number, delta: number ) {

		return;

	}

	update( elapsed: number, delta: number ) {

		if ( ! this.assetsLoaded ) return;

		this.orbit.update();

		this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
		this.bolt.clear( 1, 1, 1, 1 );

		this.bolt.draw( this.gltf );
		this.bolt.draw( this.floor );


	}

	lateUpdate( elapsed: number, delta: number ) {

		return;

	}

}
