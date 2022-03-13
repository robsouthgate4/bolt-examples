import Base from "@webgl/Base";
import Shader from "../../core/Shader";

import defaultVertexInstanced from "../../examples/shaders/defaultInstanced/defaultInstanced.vert";
import defaultFragmentInstanced from "../../examples/shaders/defaultInstanced/defaultInstanced.frag";

import { mat4, quat, vec3, } from "gl-matrix";

import Transform from "../../core/Transform";
import ArrayBuffer from "../../core/ArrayBuffer";
import GLTFParser from "../../modules/GLTFParser";
import Camera from "@/webgl/core/Camera";
import Bolt from "@/webgl/core/Bolt";

export default class extends Base {

  canvas: HTMLCanvasElement;
  shader: Shader;
  lightPosition: vec3;
  camera: Camera;
  assetsLoaded!: boolean;
  cubeTransform!: Transform;
  torusBuffer!: ArrayBuffer;
  bolt: Bolt;

  constructor() {

  	super();

  	const devicePixelRatio = Math.min( 2, window.devicePixelRatio || 1 );

  	this.width = window.innerWidth * devicePixelRatio;
  	this.height = window.innerHeight * devicePixelRatio;

  	this.canvas = <HTMLCanvasElement>document.getElementById( "experience" );
  	this.canvas.width = this.width;
  	this.canvas.height = this.height;

  	this.bolt = Bolt.getInstance();
  	this.bolt.init( this.canvas, { antialias: true } );

  	this.shader = new Shader( defaultVertexInstanced, defaultFragmentInstanced );
  	this.lightPosition = vec3.fromValues( 0, 10, 0 );

  	this.camera = new Camera(
  		this.width,
  		this.height,
  		vec3.fromValues( 0, 15, 10 ),
  		45,
  		0.01,
  		1000,
  	);

  	this.camera.lookAt( vec3.fromValues( 0, 0, - 50 ) );

  	this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
  	this.bolt.enableDepth();

  	this.init();


  }

  async init() {

  	const gltfLoader = new GLTFParser( "/static/models/gltf/torus.gltf" );

  	const geometry = await gltfLoader.loadGLTF();

  	if ( ! geometry ) return;

  	this.assetsLoaded = true;

  	// set shader uniforms
  	this.shader.activate();
  	this.shader.setVector3( "objectColor", vec3.fromValues( 1.0, 0.0, 0.0 ) );
  	this.shader.setVector3( "lightColor", vec3.fromValues( 0.95, 1.0, 1.0 ) );

  	const instanceCount = 2000;

  	const instanceMatrices: mat4[] = [];

  	for ( let i = 0; i < instanceCount; i ++ ) {

  		const x = ( Math.random() * 2 - 1 ) * 50;
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

  	// setup nodes
  	this.torusBuffer = new ArrayBuffer(
  		geometry,
  		{
  			instanced: true,
  			instanceCount,
  			instanceMatrices
  		}
  	),

  	this.resize();

  }

  resize() {

  	const displayWidth = this.bolt.gl.canvas.clientWidth;
  	const displayHeight = this.bolt.gl.canvas.clientHeight;

  	// Check if the this.bolt.gl.canvas is not the same size.
  	const needResize = this.bolt.gl.canvas.width !== displayWidth ||
                     this.bolt.gl.canvas.height !== displayHeight;

  	if ( needResize ) {

  		this.bolt.gl.canvas.width = displayWidth;
  		this.bolt.gl.canvas.height = displayHeight;

  	}

  	this.camera.resize( this.bolt.gl.canvas.width, this.bolt.gl.canvas.height );

  }

  earlyUpdate( elapsed: number, delta: number ) {

  	super.earlyUpdate( elapsed, delta );

  }

  update( elapsed: number, delta: number ) {

  	if ( ! this.assetsLoaded ) return;

  	super.update( elapsed, delta );

  	this.camera.update();

  	this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
  	this.bolt.clear( 1, 1, 1, 1 );

  	this.shader.activate();
  	this.shader.setVector3( "viewPosition", this.camera.position );
  	this.shader.setFloat( "time", elapsed );
  	this.shader.setMatrix4( "projection", this.camera.getProjectionMatrix() );
  	this.shader.setMatrix4( "view", this.camera.getViewMatrix() );

  	this.torusBuffer.drawTriangles( this.shader );

  }

  lateUpdate( elapsed: number, delta: number ) {

  	super.lateUpdate( elapsed, delta );

  }

}
