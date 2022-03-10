import Base from "@webgl/Base";
import Shader from "../../core/Shader";
import defaultVertex from "../../core/shaders/default/default.vert";
import defaultFragment from "../../core/shaders/default/default.frag";

import { vec3, } from "gl-matrix";
import Node from "../../core/Node";
import Transform from "../../core/Transform";
import CameraArcball from "../../modules/CameraArcball";
import ArrayBuffer from "../../core/ArrayBuffer";
import GLTFParser from "../../modules/GLTFParser";
import Bolt from "@/webgl/core/Bolt";

export default class extends Base {

  canvas: HTMLCanvasElement;
  shader: Shader;
  lightPosition: vec3;
  camera: CameraArcball;
  assetsLoaded!: boolean;
  torusTransform!: Transform;
  torusNode!: Node;
  bolt: any;

  constructor() {

  	super();

  	this.width = window.innerWidth;
  	this.height = window.innerHeight;

  	this.canvas = <HTMLCanvasElement>document.getElementById( "experience" );
  	this.canvas.width = this.width;
  	this.canvas.height = this.height;

  	this.bolt = Bolt.getInstance();
  	this.bolt.init( this.canvas, { antialias: true } );

  	this.shader = new Shader( defaultVertex, defaultFragment );
  	this.lightPosition = vec3.fromValues( 0, 10, 0 );

  	this.camera = new CameraArcball(
  		this.width,
  		this.height,
  		vec3.fromValues( 0, 0, 3 ),
  		vec3.fromValues( 0, 0, 0 ),
  		45,
  		0.01,
  		1000,
  		0.2,
  		2
  	);

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

  	// setup nodes
  	this.torusNode = new Node(
  		new ArrayBuffer( this.bolt, geometry ),
  	);

  	this.torusNode.transform.position = vec3.fromValues( 0, 0, 0 );
  	this.torusNode.transform.scale = vec3.fromValues( 1, 1, 1 );

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
  	this.torusNode.drawTriangles( this.shader, this.camera );

  }

  lateUpdate( elapsed: number, delta: number ) {

  	super.lateUpdate( elapsed, delta );

  }

}
