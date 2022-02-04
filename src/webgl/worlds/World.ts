import Base from "@webgl/Base";
import Shader from "../core/Shader";
import Texture from "../core/Texture";

//@ts-ignore
import volumetricVertex from "../core/shaders/volumetric/volumetric.vert";
//@ts-ignore
import volumetricFragment from "../core/shaders/volumetric/volumetric.frag";

import { vec3, } from "gl-matrix";
import ArrayBuffer from "../core/ArrayBuffer";
import Node from "../modules/SceneGraph/Node";
import Transform from "../modules/SceneGraph/Transform";
import ArrayBufferInterleaved from "../core/ArrayBufferInterleaved";
import GLTFParser, { GLTFBufferObject } from "../modules/GLTFParser";
import CameraArcball from "../modules/CameraArcball";

const vertices = [
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

export default class World extends Base {

  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
  lightingShader: Shader;
  lightPosition: vec3;
  camera: CameraArcball;
  assetsLoaded!: boolean;
  cubeTransform!: Transform;
  cubeNode!: Node;
  gltfParser: GLTFParser;
  boxTransform!: Transform;
  boxNode!: Node;

  constructor() {

  	super();

  	this.width = window.innerWidth;
  	this.height = window.innerHeight;

  	this.canvas = <HTMLCanvasElement>document.getElementById( "experience" );
  	this.canvas.width = this.width;
  	this.canvas.height = this.height;

  	this.gl = <WebGL2RenderingContext> this.canvas.getContext( "webgl2", { antialias: true } );

  	this.lightingShader = new Shader( volumetricVertex, volumetricFragment, this.gl );
  	this.lightPosition = vec3.fromValues( 0, 10, 0 );

  	this.gltfParser = new GLTFParser( "/static/models/gltf/cube.gltf" );

  	this.camera = new CameraArcball(
  		this.width,
  		this.height,
  		vec3.fromValues( 0, 5, 2 ),
  		vec3.fromValues( 0, 0, 0 ),
  		45,
  		0.01,
  		1000,
  		this.gl,
  		0.2,
  		2
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

  	const boxBuffers = await this.gltfParser.loadGLTF() as GLTFBufferObject;

  	console.log( boxBuffers );

  	this.assetsLoaded = true;

  	// set shader uniforms
  	this.lightingShader.activate();
  	this.lightingShader.setVector3( "objectColor", vec3.fromValues( 1.0, 1.0, 1.0 ) );
  	this.lightingShader.setVector3( "lightColor", vec3.fromValues( 0.95, 1.0, 1.0 ) );

  	// setup transforms
  	this.cubeTransform = new Transform();
  	this.cubeTransform.position = vec3.fromValues( 0, 0, 0 );

  	this.boxTransform = new Transform();
  	this.boxTransform.position = vec3.fromValues( - 1, 0, 0 );

  	// setup nodes
  	this.cubeNode = new Node(
  		new ArrayBufferInterleaved( this.gl, 6, vertices, [], [ equi ] ),
  		this.cubeTransform
  	);

  	this.cubeNode.transform.scale = vec3.fromValues( 0.75, 0.75, 0.75 );



  	this.boxNode = new Node(
  		new ArrayBuffer( this.gl, boxBuffers.positions, boxBuffers.normals, boxBuffers.uvs, boxBuffers.indices ),
  		this.boxTransform
  	);

  	this.boxNode.setParent( this.cubeNode );

  	this.cubeNode.updateModelMatrix();

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

  	this.gl.viewport( 0, 0, this.gl.canvas.width, this.gl.canvas.height );
  	this.gl.clearColor( 1, 1, 1, 1 );
  	this.gl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT );

  	this.camera.update();

  	this.lightingShader.activate();
  	this.lightingShader.setVector3( "viewPosition", this.camera.position );
  	this.lightingShader.setFloat( "time", elapsed );

  	this.cubeNode.transform.rotation[ 1 ] += 0.01;
  	//this.cubeNode.updateModelMatrix();

  	this.cubeNode.drawTriangles( this.lightingShader, this.camera );
  	this.boxNode.drawTriangles( this.lightingShader, this.camera );

  }

  lateUpdate( elapsed: number, delta: number ) {

  	super.lateUpdate( elapsed, delta );

  }

}
