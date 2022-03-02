import Base from "@webgl/Base";
import Shader from "../../core/Shader";

//@ts-ignore
import defaultVertex from "../../core/shaders/default/default.vert";
//@ts-ignore
import defaultFragment from "../../core/shaders/default/default.frag";

import { vec3, } from "gl-matrix";
import Node from "../../modules/SceneGraph/Node";
import Transform from "../../modules/SceneGraph/Transform";
import CameraArcball from "../../modules/CameraArcball";
import ArrayBuffer from "../../core/ArrayBuffer";
import Sphere from "../../modules/Primitives/Sphere";
import Cube from "../../modules/Primitives/Box";
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

  	const sphereGeometry = new Sphere( { radius: 1, widthSegments: 32, heightSegments: 32 } );
  	const cubeGeometry = new Cube( { widthSegments: 1, heightSegments: 1 } );
  	const planeGeometry = new Plane( { widthSegments: 10, heightSegments: 10 } );

  	this.sphereNode = new Node(
  		new ArrayBuffer( this.gl, sphereGeometry.positions, sphereGeometry.normals, sphereGeometry.uvs, { indices: sphereGeometry.indices } ),
  	);

  	this.cubeNode = new Node(
  		new ArrayBuffer( this.gl, cubeGeometry.positions, cubeGeometry.normals, cubeGeometry.uvs, { indices: cubeGeometry.indices } ),
  	);

  	this.cubeNode.autoUpdate = false;
  	this.cubeNode.transform.position[ 0 ] = 1.5;
  	this.cubeNode.updateModelMatrix();

  	this.planeNode = new Node(
  		new ArrayBuffer( this.gl, planeGeometry.positions, planeGeometry.normals, planeGeometry.uvs, { indices: planeGeometry.indices } ),
  	);

  	this.planeNode.transform.position[ 0 ] = - 1.5;

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

  	this.gl.viewport( 0, 0, this.gl.canvas.width, this.gl.canvas.height );
  	this.gl.clearColor( 0, 0, 0, 0 );
  	this.gl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT );

  	this.shader.activate();
  	this.shader.setVector3( "viewPosition", this.camera.position );
  	this.shader.setFloat( "time", elapsed );

  	this.cubeNode.transform.rotation[ 1 ] += 0.01;
  	this.cubeNode.updateModelMatrix();

  	this.sphereNode.transform.rotation[ 1 ] = this.planeNode.transform.rotation[ 1 ] += 0.01;

  	this.sphereNode.drawTriangles( this.shader, this.camera );
  	this.cubeNode.drawTriangles( this.shader, this.camera );
  	this.planeNode.drawTriangles( this.shader, this.camera );

  }

  lateUpdate( elapsed: number, delta: number ) {

  	super.lateUpdate( elapsed, delta );

  }

}
