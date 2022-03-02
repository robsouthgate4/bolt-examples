import Base from "@webgl/Base";
import Shader from "../../core/Shader";
import Texture from "../../core/Texture";

//@ts-ignore
import defaultVertex from "../../core/shaders/default/default.vert";
//@ts-ignore
import defaultFragment from "../../core/shaders/default/default.frag";

import { vec3, } from "gl-matrix";
import Node from "../../modules/SceneGraph/Node";
import Transform from "../../modules/SceneGraph/Transform";
import CameraArcball from "../../modules/CameraArcball";
import ArrayBuffer from "../../core/ArrayBuffer";
import GLTFParser from "../../modules/GLTFParser";

export default class extends Base {

  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
  shader: Shader;
  lightPosition: vec3;
  camera: CameraArcball;
  assetsLoaded!: boolean;
  torusTransform!: Transform;
  torusNode!: Node;

  constructor() {

  	super();

  	this.width = window.innerWidth;
  	this.height = window.innerHeight;

  	this.canvas = <HTMLCanvasElement>document.getElementById( "experience" );
  	this.canvas.width = this.width;
  	this.canvas.height = this.height;

  	this.gl = <WebGL2RenderingContext> this.canvas.getContext( "webgl2", { antialias: true } );

  	this.shader = new Shader( defaultVertex, defaultFragment, this.gl );
  	this.lightPosition = vec3.fromValues( 0, 10, 0 );

  	this.camera = new CameraArcball(
  		this.width,
  		this.height,
  		vec3.fromValues( 0, 0, 3 ),
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


  	// setup nodes
  	this.torusNode = new Node(
  		new ArrayBuffer( this.gl, data.positions, data.normals, data.uvs, { indices: data.indices } ),
  	);

  	this.torusNode.transform.position = vec3.fromValues( 0, 0, 0 );
  	this.torusNode.transform.scale = vec3.fromValues( 1, 1, 1 );
  	this.torusNode.updateModelMatrix();

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

  	this.camera.update();

  	this.gl.viewport( 0, 0, this.gl.canvas.width, this.gl.canvas.height );
  	this.gl.clearColor( 0, 0, 0, 0 );
  	this.gl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT );

  	this.shader.activate();
  	this.shader.setVector3( "viewPosition", this.camera.position );
  	this.shader.setFloat( "time", elapsed );

  	this.torusNode.updateModelMatrix();

  	this.torusNode.drawTriangles( this.shader, this.camera );

  }

  lateUpdate( elapsed: number, delta: number ) {

  	super.lateUpdate( elapsed, delta );

  }

}
