import Base from "@webgl/Base";
import Bolt, { Program, DrawSet, Node, CameraPersp, Texture2D, REPEAT, Mesh } from "@bolt-webgl/core";

import normalmapVertex from "./shaders/normal-map/normal-map.vert";
import normalmapFragment from "./shaders/normal-map/normal-map.frag";

import colorVertex from "./shaders/color/color.vert";
import colorFragment from "./shaders/color/color.frag";

import { vec2, vec3, vec4, } from "gl-matrix";
import Orbit from "@webgl/modules/Orbit";
import Sphere from "@/webgl/modules/primitives/Sphere";
import Floor from "@/webgl/modules/draw-sets/floor";
export default class extends Base {

	canvas: HTMLCanvasElement;
	programEyes: Program;
	camera: CameraPersp;
	assetsLoaded?: boolean;
	bolt = Bolt.getInstance();
	gl: WebGL2RenderingContext;
	root!: Node;
	orbit: Orbit;
	normalMapProgram: Program;
	matcapTexture!: Texture2D;
	normalTexture!: Texture2D;
	sphereDrawSet!: DrawSet;
	floorDrawSet: any;

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
			position: vec3.fromValues( 0, 2, 5 ),
			target: vec3.fromValues( 0, 1, 0 ),
		} );

		this.orbit = new Orbit( this.camera );

		this.bolt.init( this.canvas, { antialias: true, dpi: 2 } );
		this.bolt.setCamera( this.camera );

		this.gl = this.bolt.getContext();

		this.programEyes = new Program( colorVertex, colorFragment );
		this.normalMapProgram = new Program( normalmapVertex, normalmapFragment );

		this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
		this.bolt.enableDepth();

		this.init();


	}

	async init() {

		this.matcapTexture = new Texture2D( {
			imagePath: "/static/textures/matcap/matcap3.jpeg"
		} );

		this.normalTexture = new Texture2D( {
			imagePath: "/static/textures/normal-map/metal-normal.jpeg",
			wrapS: REPEAT,
			wrapT: REPEAT
		} );

		await this.matcapTexture.load();
		await this.normalTexture.load();

		this.assetsLoaded = true;

		this.normalMapProgram.activate();
		this.normalMapProgram.setTexture( "baseTexture", this.matcapTexture );
		this.normalMapProgram.setVector2( "normalUVScale", vec2.fromValues( 0.5, 0.5 ) );
		this.normalMapProgram.setFloat( "normalHeight", 0.1 );
		this.normalMapProgram.setTexture( "normalTexture", this.normalTexture );
		this.normalMapProgram.setVector4( "baseColor", vec4.fromValues( 1, 1, 1, 1 ) );

		this.root = new Node();
		this.sphereDrawSet = new DrawSet( new Mesh( new Sphere( { widthSegments: 24, heightSegments: 24 } ) ), this.normalMapProgram );
		this.sphereDrawSet.transform.positionY = 1;
		this.sphereDrawSet.setParent( this.root );

		this.floorDrawSet = new Floor();
		this.floorDrawSet.setParent( this.root );

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

		this.orbit.update();

		this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
		this.bolt.clear( 0, 0, 0, 1 );

		this.sphereDrawSet.transform.rotateY( 0.15 * delta );

		this.bolt.draw( this.root );


	}

	lateUpdate( elapsed: number, delta: number ): void {

		return;

	}

}
