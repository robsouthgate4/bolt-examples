import Base from "@webgl/Base";
import Shader from "../../core/Shader";
import Texture from "../../core/Texture";


//@ts-ignore
import defaultVertexInstanced from "../../core/shaders/defaultInstanced/defaultInstanced.vert";
//@ts-ignore
import defaultFragmentInstanced from "../../core/shaders/defaultInstanced/defaultInstanced.frag";

import { mat4, quat, vec3, } from "gl-matrix";

import Transform from "../../modules/SceneGraph/Transform";
import ArrayBuffer from "../../core/ArrayBuffer";
import CameraFPS from "../../modules/CameraFPS";
import GLTFParser from "../../modules/GLTFParser";

export default class extends Base {

  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
  shader: Shader;
  lightPosition: vec3;
  camera: CameraFPS;
  assetsLoaded!: boolean;
  cubeTransform!: Transform;
  torusBuffer!: ArrayBuffer;

  constructor() {

  	super();

  	const devicePixelRatio = Math.min( 2, window.devicePixelRatio || 1 );

  	this.width = window.innerWidth * devicePixelRatio;
  	this.height = window.innerHeight * devicePixelRatio;

  	this.canvas = <HTMLCanvasElement>document.getElementById( "experience" );
  	this.canvas.width = this.width;
  	this.canvas.height = this.height;

  	this.gl = <WebGL2RenderingContext> this.canvas.getContext( "webgl2", { antialias: true } );

  	this.shader = new Shader( defaultVertexInstanced, defaultFragmentInstanced, this.gl );
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

  	const gltfLoader = new GLTFParser( "/static/models/gltf/torus.gltf" );

  	const data = await gltfLoader.loadGLTF();

  	if ( ! data ) return;

  	this.assetsLoaded = true;

  	// set shader uniforms
  	this.shader.activate();
  	this.shader.setVector3( "objectColor", vec3.fromValues( 1.0, 0.0, 0.0 ) );
  	this.shader.setVector3( "lightColor", vec3.fromValues( 0.95, 1.0, 1.0 ) );
  	this.shader.setTexture( "mapEqui", equi );
  	this.shader.setTexture( "mapAO", AO );

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

  	const devicePixelRatio = Math.min( 2, window.devicePixelRatio || 1 );

  	const displayWidth = this.gl.canvas.clientWidth;
  	const displayHeight = this.gl.canvas.clientHeight;

  	const needResize = this.gl.canvas.width !== displayWidth ||
                     this.gl.canvas.height !== displayHeight;

  	if ( needResize ) {

  		this.gl.canvas.width = displayWidth * devicePixelRatio;
  		this.gl.canvas.height = displayHeight * devicePixelRatio;

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