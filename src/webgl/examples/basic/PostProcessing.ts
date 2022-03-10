import Base from "@webgl/Base";
import Shader from "../../core/Shader";

import defaultVertex from "../../core/shaders/default/default.vert";
import defaultFragment from "../../core/shaders/default/default.frag";

import { vec3, } from "gl-matrix";
import Node from "../../core/Node";
import Transform from "../../core/Transform";
import CameraArcball from "../../modules/CameraArcball";
import ArrayBuffer from "../../core/ArrayBuffer";
import Sphere from "../../modules/Primitives/Sphere";
import Post from "@/webgl/modules/Post/Post";
import Plane from "@/webgl/modules/Primitives/Plane";
import FXAAPass from "@/webgl/modules/Post/passes/FXAAPass";
import RGBSplitPass from "@/webgl/modules/Post/passes/RGBSplitPass";
import PixelatePass from "@/webgl/modules/Post/passes/PixelatePass";
import RenderPass from "@/webgl/modules/Post/passes/RenderPass";

import Bolt from "@/webgl/core/Bolt";

export default class extends Base {

  canvas: HTMLCanvasElement;
  shader: Shader;
  lightPosition: vec3;
  camera: CameraArcball;
  assetsLoaded?: boolean;
  torusTransform!: Transform;
  sphereNode!: Node;
  cubeNode!: Node;
  planeNode!: Node;
  post: Post;
  fxaa!: FXAAPass;
  rbgSplit!: RGBSplitPass;
  renderPass!: RenderPass;
  pixelate!: PixelatePass;
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

  	this.post = new Post( this.bolt );

  	this.shader = new Shader( defaultVertex, defaultFragment );
  	this.lightPosition = vec3.fromValues( 0, 10, 0 );

  	this.camera = new CameraArcball(
  		this.width,
  		this.height,
  		vec3.fromValues( 0, 2, 6 ),
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

  	this.renderPass = new RenderPass( this.bolt, {
  		width: this.width,
  		height: this.height
  	} );

  	this.fxaa = new FXAAPass( this.bolt, {
  		width: this.width,
  		height: this.height
  	} );

  	this.rbgSplit = new RGBSplitPass( this.bolt, {
  		width: this.width,
  		height: this.height
  	} );

  	this.pixelate = new PixelatePass( this.bolt, {
  		width: this.width,
  		height: this.height,
  		xPixels: 100,
  		yPixels: 100
  	} );

  	this.post.add( this.renderPass );
  	this.post.add( this.rbgSplit );
  	this.post.add( this.pixelate, false );
  	this.post.add( this.fxaa, true );

  	const sphereGeometry = new Sphere( { radius: 1, widthSegments: 64, heightSegments: 64 } );
  	const planeGeometry = new Plane( { widthSegments: 2, heightSegments: 2 } );

  	this.sphereNode = new Node(
  		new ArrayBuffer( sphereGeometry ),
  	);

  	this.planeNode = new Node(
  		new ArrayBuffer( planeGeometry ),
  	);

  	this.planeNode.transform.scale[ 0 ] = 3;
  	this.planeNode.transform.scale[ 1 ] = 3;
  	this.planeNode.transform.scale[ 2 ] = 3;

  	this.planeNode.transform.rotation[ 0 ] = Math.PI * 0.5;
  	this.planeNode.transform.position[ 1 ] = - 0.25;

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

  	super.update( elapsed, delta );

  	this.post.begin();

  	this.camera.update();

  	this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
  	this.bolt.clear( 1, 1, 1, 1 );

  	this.sphereNode.drawTriangles( this.shader, this.camera );
  	this.planeNode.drawTriangles( this.shader, this.camera );

  	this.post.end();


  }

  lateUpdate( elapsed: number, delta: number ) {

  	super.lateUpdate( elapsed, delta );

  }

}
