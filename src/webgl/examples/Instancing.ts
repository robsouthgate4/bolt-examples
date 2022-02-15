import Base from "@webgl/Base";
import Shader from "../core/Shader";
import Texture from "../core/Texture";


//@ts-ignore
import defaultVertexInstanced from "../core/shaders/defaultInstanced/defaultInstanced.vert";
//@ts-ignore
import defaultFragmentInstanced from "../core/shaders/defaultInstanced/defaultInstanced.frag";

import { mat4, quat, vec3, } from "gl-matrix";

import Transform from "../modules/SceneGraph/Transform";
import ArrayBuffer from "../core/ArrayBuffer";
import CameraFPS from "../modules/CameraFPS";
import GLTFParser from "../modules/GLTFParser";

export default class extends Base {

  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
  lightingShader: Shader;
  lightPosition: vec3;
  camera: CameraFPS;
  assetsLoaded!: boolean;
  cubeTransform!: Transform;
  torusBuffer!: ArrayBuffer;

  constructor() {

  	super();

  	this.width = window.innerWidth;
  	this.height = window.innerHeight;

  	this.canvas = <HTMLCanvasElement>document.getElementById( "experience" );
  	this.canvas.width = this.width;
  	this.canvas.height = this.height;

  	this.gl = <WebGL2RenderingContext> this.canvas.getContext( "webgl2", { antialias: true } );

  	this.lightingShader = new Shader( defaultVertexInstanced, defaultFragmentInstanced, this.gl );
  	this.lightPosition = vec3.fromValues( 0, 10, 0 );

  	this.camera = new CameraFPS(
  		this.width,
  		this.height,
  		vec3.fromValues( 0, 4, 10 ),
  		45,
  		0.01,
  		1000,
  		this.gl,
  	);

  	this.gl.viewport( 0, 0, this.gl.canvas.width, this.gl.canvas.height );
  	this.gl.enable( this.gl.DEPTH_TEST );

  	this.init();


  }

  async init() {

  	const equi = new Texture(
  		"/static/textures/equi-studio.jpg",
  		this.gl );
  	equi.loadImage();

  	const AO = new Texture(
  		"/static/models/gltf/AO.png",
  		this.gl );
  	AO.loadImage();

	const gltfLoader =  new GLTFParser("/static/models/gltf/torus.gltf");

	const data = await gltfLoader.loadGLTF();

	if( !data ) return;

  	this.assetsLoaded = true;

  	// set shader uniforms
  	this.lightingShader.activate();
  	this.lightingShader.setVector3( "objectColor", vec3.fromValues( 1.0, 0.0, 0.0 ) );
  	this.lightingShader.setVector3( "lightColor", vec3.fromValues( 0.95, 1.0, 1.0 ) );
  	this.lightingShader.setTexture( "mapEqui", equi );
  	this.lightingShader.setTexture( "mapAO", AO );

  	const instanceCount = 100;

  	const instanceMatrices: mat4[] = [];

  	for ( let i = 0; i < instanceCount; i ++ ) {

  		const x = ( Math.random() * 2 - 1 ) * 10;
  		const y = ( Math.random() * 2 - 1 ) * 2;
  		const z = Math.random() * 50;

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
  		this.gl,
		data.positions,
		data.normals, 
		data.uvs,
		{
			indices: data.indices,
			instanced: true,
			instanceCount,
			instanceMatrices
		}
  	),

  	this.resize();

  }

  resize() {

  	const displayWidth = this.gl.canvas.clientWidth;
  	const displayHeight = this.gl.canvas.clientHeight;

  	// Check if the this.gl.canvas is not the same size.
  	const needResize = this.gl.canvas.width !== displayWidth ||
                     this.gl.canvas.height !== displayHeight;

  	if ( needResize ) {

  		this.gl.canvas.width = displayWidth;
  		this.gl.canvas.height = displayHeight;

  	}

  	this.camera.resize( this.gl.canvas.width, this.gl.canvas.height );

  }

  earlyUpdate( elapsed: number, delta: number ) {

  	super.earlyUpdate( elapsed, delta );

  }

  update( elapsed: number, delta: number ) {

  	if ( ! this.assetsLoaded ) return;

  	super.update( elapsed, delta );

  	this.camera.update( delta );

  	this.gl.viewport( 0, 0, this.gl.canvas.width, this.gl.canvas.height );
  	this.gl.clearColor( 0, 0, 0, 0 );
  	this.gl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT );

  	this.lightingShader.activate();
  	this.lightingShader.setVector3( "viewPosition", this.camera.position );
  	this.lightingShader.setFloat( "time", elapsed );
  	this.lightingShader.setMatrix4( "projection", this.camera.getProjectionMatrix() );
  	this.lightingShader.setMatrix4( "view", this.camera.getViewMatrix() );

  	this.torusBuffer.drawTriangles( this.lightingShader );

  }

  lateUpdate( elapsed: number, delta: number ) {

  	super.lateUpdate( elapsed, delta );

  }

}