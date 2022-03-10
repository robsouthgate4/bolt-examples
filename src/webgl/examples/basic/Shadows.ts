import Base from "@webgl/Base";
import Shader from "../../core/Shader";

import defaultVertex from "../../core/shaders/default/default.vert";
import defaultFragment from "../../core/shaders/default/default.frag";

import { mat4, vec3, } from "gl-matrix";
import Node from "../../core/Node";
import Transform from "../../core/Transform";
import CameraArcball from "../../modules/CameraArcball";
import ArrayBuffer from "../../core/ArrayBuffer";
import Sphere from "../../modules/Primitives/Sphere";
import Plane from "../../modules/Primitives/Plane";

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
  depthMapFBO!: WebGLFramebuffer | null;
  depthMapTexture!: WebGLTexture | null;
  shadowWidth = 1024;
  shadowHeight = 1024;
  lightProjection!: mat4;
  lightView!: mat4;
  lightSpaceMatrix!: mat4;

  constructor() {

  	super();

  	this.width = window.innerWidth;
  	this.height = window.innerHeight;

  	this.canvas = <HTMLCanvasElement>document.getElementById( "experience" );
  	this.canvas.width = this.width;
  	this.canvas.height = this.height;

  	this.gl = <WebGL2RenderingContext> this.canvas.getContext( "webgl2", { antialias: true } );

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

  	this.gl.viewport( 0, 0, this.gl.canvas.width, this.gl.canvas.height );
  	this.gl.enable( this.gl.DEPTH_TEST );

  	this.init();


  }

  async init() {

  	const sphereGeometry = new Sphere( { radius: 1, widthSegments: 32, heightSegments: 32 } );
  	const planeGeometry = new Plane( { widthSegments: 10, heightSegments: 10 } );

  	this.sphereNode = new Node(
  		new ArrayBuffer( sphereGeometry ),
  	);

  	this.planeNode = new Node(
  		new ArrayBuffer( planeGeometry ),
  	);

  	this.planeNode.transform.position[ 1 ] = - 0.25;
  	this.planeNode.transform.scale[ 0 ] = 5;
  	this.planeNode.transform.scale[ 1 ] = 5;
  	this.planeNode.transform.scale[ 2 ] = 5;
  	this.planeNode.transform.rotation[ 0 ] = Math.PI * 0.5;

  	// configure light

  	const nearPlane = 1;
  	const farPlane = 7.5;

  	this.lightProjection = mat4.create();
  	mat4.ortho( this.lightProjection, - 10, 10, - 10, 10, nearPlane, farPlane );

  	this.lightView = mat4.create();
  	mat4.lookAt( this.lightView, vec3.fromValues( - 2, 4, - 1 ), vec3.fromValues( 0, 0, 0 ), vec3.fromValues( 0, 1, 0 ) );

  	this.lightSpaceMatrix = mat4.create();
  	mat4.multiply( this.lightSpaceMatrix, this.lightProjection, this.lightView );

  	// create depth fbo

  	this.depthMapFBO = <WebGLFramebuffer> this.gl.createFramebuffer();

  	this.depthMapTexture = <WebGLTexture> this.gl.createTexture();
  	this.gl.bindTexture( this.gl.TEXTURE_2D, this.depthMapTexture );

  	// create depth texture

  	this.gl.texImage2D(
  		this.gl.TEXTURE_2D,
  		0,
  		this.gl.DEPTH_COMPONENT,
  		this.shadowWidth,
  		this.shadowHeight,
  		0,
  		this.gl.DEPTH_COMPONENT,
  		this.gl.FLOAT,
  		null );

  	this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST );
  	this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST );
  	this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT );
  	this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT );

  	this.gl.bindFramebuffer( this.gl.FRAMEBUFFER, this.depthMapFBO );
  	this.gl.framebufferTexture2D( this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.TEXTURE_2D, this.depthMapTexture, 0 );

  	this.gl.bindFramebuffer( this.gl.FRAMEBUFFER, null );

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

  	this.camera.update();

  	// render to depth

  	{

  		this.gl.viewport( 0, 0, this.shadowWidth, this.shadowHeight );
  		this.gl.bindFramebuffer( this.gl.FRAMEBUFFER, this.depthMapFBO );
  		this.gl.clearColor( 0, 0, 0, 0 );
  		this.gl.clear( this.gl.DEPTH_BUFFER_BIT );

  		this.gl.bindFramebuffer( this.gl.FRAMEBUFFER, null );

  	}

  	// render scene normally

  	{

  		this.gl.viewport( 0, 0, this.gl.canvas.width, this.gl.canvas.height );
  		this.gl.clearColor( 0, 0, 0, 0 );
  		this.gl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT );

  		this.shader.activate();
  		this.shader.setVector3( "viewPosition", this.camera.position );
  		this.shader.setFloat( "time", elapsed );

  		this.sphereNode.transform.rotation[ 1 ] = 0.01;

  		this.sphereNode.drawTriangles( this.shader, this.camera );
  		this.planeNode.drawTriangles( this.shader, this.camera );

  	}



  }

  lateUpdate( elapsed: number, delta: number ) {

  	super.lateUpdate( elapsed, delta );

  }

}
