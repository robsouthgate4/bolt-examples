import Base from "@webgl/Base";
import Bolt, { ArrayBufferInterleaved, FBO, Shader, Transform } from "@robsouthgate/bolt-core";


import defaultVertexInstanced from "../../examples/shaders/defaultInstanced/defaultInstanced.vert";
import defaultFragmentInstanced from "../../examples/shaders/defaultInstanced/defaultInstanced.frag";

import { mat4, quat, vec3, } from "gl-matrix";
import CameraArcball from "../../modules/CameraArcball";
import CameraFPS from "../../modules/CameraFPS";

const buffer = [
	- 0.5, - 0.5, - 0.5, 0.0, 0.0, - 1.0,
	0.5, - 0.5, - 0.5, 0.0, 0.0, - 1.0,
	0.5, 0.5, - 0.5, 0.0, 0.0, - 1.0,
	0.5, 0.5, - 0.5, 0.0, 0.0, - 1.0,
	- 0.5, 0.5, - 0.5, 0.0, 0.0, - 1.0,
	- 0.5, - 0.5, - 0.5, 0.0, 0.0, - 1.0,

	- 0.5, - 0.5, 0.5, 0.0, 0.0, 1.0,
	0.5, - 0.5, 0.5, 0.0, 0.0, 1.0,
	0.5, 0.5, 0.5, 0.0, 0.0, 1.0,
	0.5, 0.5, 0.5, 0.0, 0.0, 1.0,
	- 0.5, 0.5, 0.5, 0.0, 0.0, 1.0,
	- 0.5, - 0.5, 0.5, 0.0, 0.0, 1.0,

	- 0.5, 0.5, 0.5, - 1.0, 0.0, 0.0,
	- 0.5, 0.5, - 0.5, - 1.0, 0.0, 0.0,
	- 0.5, - 0.5, - 0.5, - 1.0, 0.0, 0.0,
	- 0.5, - 0.5, - 0.5, - 1.0, 0.0, 0.0,
	- 0.5, - 0.5, 0.5, - 1.0, 0.0, 0.0,
	- 0.5, 0.5, 0.5, - 1.0, 0.0, 0.0,

	0.5, 0.5, 0.5, 1.0, 0.0, 0.0,
	0.5, 0.5, - 0.5, 1.0, 0.0, 0.0,
	0.5, - 0.5, - 0.5, 1.0, 0.0, 0.0,
	0.5, - 0.5, - 0.5, 1.0, 0.0, 0.0,
	0.5, - 0.5, 0.5, 1.0, 0.0, 0.0,
	0.5, 0.5, 0.5, 1.0, 0.0, 0.0,

	- 0.5, - 0.5, - 0.5, 0.0, - 1.0, 0.0,
	0.5, - 0.5, - 0.5, 0.0, - 1.0, 0.0,
	0.5, - 0.5, 0.5, 0.0, - 1.0, 0.0,
	0.5, - 0.5, 0.5, 0.0, - 1.0, 0.0,
	- 0.5, - 0.5, 0.5, 0.0, - 1.0, 0.0,
	- 0.5, - 0.5, - 0.5, 0.0, - 1.0, 0.0,

	- 0.5, 0.5, - 0.5, 0.0, 1.0, 0.0,
	0.5, 0.5, - 0.5, 0.0, 1.0, 0.0,
	0.5, 0.5, 0.5, 0.0, 1.0, 0.0,
	0.5, 0.5, 0.5, 0.0, 1.0, 0.0,
	- 0.5, 0.5, 0.5, 0.0, 1.0, 0.0,
	- 0.5, 0.5, - 0.5, 0.0, 1.0, 0.0
];

export default class extends Base {

  canvas: HTMLCanvasElement;
  shader: Shader;
  lightPosition: vec3;
  camera: CameraArcball | CameraFPS;
  assetsLoaded!: boolean;
  cubeTransform!: Transform;
  cubeNode!: ArrayBufferInterleaved;
  fbo!: FBO;
  bolt: Bolt;

  constructor() {

  	super();

  	this.width = window.innerWidth;
  	this.height = window.innerHeight;

  	this.canvas = <HTMLCanvasElement>document.getElementById( "experience" );
  	this.canvas.width = this.width;
  	this.canvas.height = this.height;

  	this.bolt = Bolt.getInstance();
  	this.bolt.init( this.canvas, { antialias: true } );

  	this.shader = new Shader( defaultVertexInstanced, defaultFragmentInstanced );
  	this.lightPosition = vec3.fromValues( 0, 10, 0 );

  	this.camera = new CameraFPS(
  		this.width,
  		this.height,
  		vec3.fromValues( 0, 4, 10 ),
  		45,
  		0.01,
  		1000
  	);

  	this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
  	this.bolt.enableDepth();

  	this.init();


  }

  async init() {

  	this.assetsLoaded = true;

  	// set shader uniforms
  	this.shader.activate();
  	this.shader.setVector3( "objectColor", vec3.fromValues( 1.0, 0.0, 0.0 ) );
  	this.shader.setVector3( "lightColor", vec3.fromValues( 0.95, 1.0, 1.0 ) );

  	const instanceCount = 10000;

  	const instanceMatrices: mat4[] = [];

  	for ( let i = 0; i < instanceCount; i ++ ) {

  		const x = ( Math.random() * 2 - 1 ) * 100;
  		const y = ( Math.random() * 2 - 1 ) * 2;
  		const z = Math.random() * 500;

  		const tempTranslation = vec3.fromValues( x, y, - z );
  		const tempRotation = quat.fromValues( 0, 0, 0, 0 );
  		const tempScale = vec3.fromValues( 1, 1, 1 );

  		const translation = mat4.create();
  		mat4.fromTranslation( translation, tempTranslation );

  		const rotation = mat4.create();
  		mat4.fromQuat( rotation, tempRotation );

  		const scale = mat4.create();
  		mat4.fromScaling( scale, tempScale );

  		const combined = mat4.create();
  		mat4.multiply( combined, translation, rotation );
  		mat4.multiply( combined, combined, scale );

  		instanceMatrices.push( combined );

  	}

  	// setup transforms
  	this.cubeTransform = new Transform();

  	// setup nodes
  	this.cubeNode = new ArrayBufferInterleaved(
  		6,
  		buffer,
  		{
  			instanced: true,
  			instanceCount,
  			instanceMatrices
  		}
  	),

  	this.resize();

  }

  resize() {

  	this.bolt.resizeFullScreen();

  }

  earlyUpdate( elapsed: number, delta: number ) {

  	super.earlyUpdate( elapsed, delta );

  }

  update( elapsed: number, delta: number ) {

  	if ( ! this.assetsLoaded ) return;

  	super.update( elapsed, delta );

  	this.camera.update( delta );

  	this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
  	this.bolt.clear( 1, 1, 1, 1 );

  	this.shader.activate();
  	this.shader.setVector3( "viewPosition", this.camera.position );
  	this.shader.setFloat( "time", elapsed );
  	this.shader.setMatrix4( "projection", this.camera.getProjectionMatrix() );
  	this.shader.setMatrix4( "view", this.camera.getViewMatrix() );

  	this.cubeNode.drawTriangles( this.shader );

  }

  lateUpdate( elapsed: number, delta: number ) {

  	super.lateUpdate( elapsed, delta );

  }

}
