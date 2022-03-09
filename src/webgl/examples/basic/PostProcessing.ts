import Base from "@webgl/Base";
import Shader from "../../core/Shader";

import defaultVertex from "../../core/shaders/default/default.vert";
import defaultFragment from "../../core/shaders/default/default.frag";

import { vec3, } from "gl-matrix";
import Node from "../../modules/SceneGraph/Node";
import Transform from "../../modules/SceneGraph/Transform";
import CameraArcball from "../../modules/CameraArcball";
import ArrayBuffer from "../../core/ArrayBuffer";
import Sphere from "../../modules/Primitives/Sphere";
import Post from "@/webgl/modules/Post";
import Plane from "@/webgl/modules/Primitives/Plane";

export default class extends Base {

  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
  shader: Shader;
  lightPosition: vec3;
  camera: CameraArcball;
  assetsLoaded?: boolean;
  torusTransform!: Transform;
  sphereNode!: Node;
  cubeNode!: Node;
  planeNode!: Node;
  post: Post;

  constructor() {

  	super();

  	this.width = window.innerWidth;
  	this.height = window.innerHeight;

  	this.canvas = <HTMLCanvasElement>document.getElementById( "experience" );
  	this.canvas.width = this.width;
  	this.canvas.height = this.height;

  	this.gl = <WebGL2RenderingContext> this.canvas.getContext( "webgl2", { antialias: true } );

  	this.post = new Post( this.gl );

  	this.shader = new Shader( defaultVertex, defaultFragment, this.gl );
  	this.lightPosition = vec3.fromValues( 0, 10, 0 );

  	this.camera = new CameraArcball(
  		this.width,
  		this.height,
  		vec3.fromValues( 0, 2, 6 ),
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

  	const sphereGeometry = new Sphere( { radius: 1, widthSegments: 64, heightSegments: 64 } );
  	const planeGeometry = new Plane( { widthSegments: 2, heightSegments: 2 } );

  	this.sphereNode = new Node(
  		new ArrayBuffer( this.gl, sphereGeometry ),
  	);

  	this.planeNode = new Node(
  		new ArrayBuffer( this.gl, planeGeometry ),
  	);

  	this.planeNode.transform.scale[ 0 ] = 3;
  	this.planeNode.transform.scale[ 1 ] = 3;
  	this.planeNode.transform.scale[ 2 ] = 3;

  	this.planeNode.transform.rotation[ 0 ] = Math.PI * 0.5;
  	this.planeNode.transform.position[ 1 ] = - 0.25;

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

  	super.update( elapsed, delta );

  	this.post.begin();

  	this.camera.update();

  	this.gl.viewport( 0, 0, this.gl.canvas.width, this.gl.canvas.height );
  	this.gl.clearColor( 0, 0, 0, 0 );
  	this.gl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT );

  	this.shader.activate();

  	this.sphereNode.drawTriangles( this.shader, this.camera );
  	this.planeNode.drawTriangles( this.shader, this.camera );

  	this.post.end();


  }

  lateUpdate( elapsed: number, delta: number ) {

  	super.lateUpdate( elapsed, delta );

  }

}
