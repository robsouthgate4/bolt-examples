import Base from "@webgl/Base";
import Bolt, { Shader, Batch, Node, CameraPersp, Texture2D, REPEAT, Mesh } from "@bolt-webgl/core";

import normalmapVertex from "./shaders/normal-map/normal-map.vert";
import normalmapFragment from "./shaders/normal-map/normal-map.frag";

import colorVertex from "./shaders/color/color.vert";
import colorFragment from "./shaders/color/color.frag";

import { vec2, vec3, vec4, } from "gl-matrix";
import CameraArcball from "@webgl/modules/CameraArcball";
import Sphere from "@/webgl/modules/primitives/Sphere";
import Floor from "@/webgl/modules/batches/floor";
export default class extends Base {

	canvas: HTMLCanvasElement;
	shaderEyes: Shader;
	camera: CameraPersp;
	assetsLoaded?: boolean;
	bolt = Bolt.getInstance();
	gl: WebGL2RenderingContext;
	root!: Node;
	arcball: CameraArcball;
	normalMapShader: Shader;
	matcapTexture!: Texture2D;
	normalTexture!: Texture2D;
	sphereBatch!: Batch;
	floorBatch: any;

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

		this.arcball = new CameraArcball( this.camera, 4, 0.08 );

		this.bolt.init( this.canvas, { antialias: true, dpi: 2 } );
		this.bolt.setCamera( this.camera );

		this.gl = this.bolt.getContext();

		this.shaderEyes = new Shader( colorVertex, colorFragment );
		this.normalMapShader = new Shader( normalmapVertex, normalmapFragment );

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

		this.normalMapShader.activate();
		this.normalMapShader.setTexture( "baseTexture", this.matcapTexture );
		this.normalMapShader.setVector2( "normalUVScale", vec2.fromValues( 2, 2 ) );
		this.normalMapShader.setFloat( "normalHeight", 0.1 );
		this.normalMapShader.setTexture( "normalTexture", this.normalTexture );
		this.normalMapShader.setVector4( "baseColor", vec4.fromValues( 1, 1, 1, 1 ) );

		this.root = new Node();
		this.sphereBatch = new Batch( new Mesh( new Sphere( { widthSegments: 24, heightSegments: 24 } ) ), this.normalMapShader );
		this.sphereBatch.transform.positionY = 1;
		this.sphereBatch.setParent( this.root );

		this.floorBatch = new Floor();
		this.floorBatch.setParent( this.root );

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
		this.bolt.clear( 0.6, 0.6, 0.6, 1 );

		this.sphereBatch.transform.rotateY( 0.15 * delta );

		this.bolt.draw( this.root );


	}

	lateUpdate( elapsed: number, delta: number ): void {

		return;

	}

}
