import Base from "@webgl/Base";
import Shader from "../../core/Shader";

import particlesVertexInstanced from "../../core/shaders/gpgpu/particles.vert";
import particlesFragmentInstanced from "../../core/shaders/gpgpu/particles.frag";

import simulationVertex from "../../core/shaders/gpgpu/simulation/simulation.vert";
import simulationFragment from "../../core/shaders/gpgpu/simulation/simulation.frag";

import { mat4, vec3, } from "gl-matrix";

import Transform from "../../modules/SceneGraph/Transform";
import ArrayBufferInterleaved from "../../core/ArrayBufferInterleaved";
import CameraFPS from "../../modules/CameraFPS";
import VBO from "../../core/VBO";
import VAO from "../../core/VAO";

export default class extends Base {

  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
  particleShader!: Shader;
  lightPosition: vec3;
  camera: CameraFPS;
  assetsLoaded!: boolean;
  cubeTransform!: Transform;
  torusBuffer!: ArrayBufferInterleaved;
  simulationShader!: Shader;
  simulationShaderLocations!: { tfOldPosition: number; tfOldVelocity: number; };
  particleShaderLocations!: { aPosition: number; };
  tf1?: WebGLTransformFeedback;
  tf2?: WebGLTransformFeedback;
  current!: { updateVAO: VAO; tf: WebGLTransformFeedback; drawVAO: VAO; };
  next!: { updateVAO: VAO; tf: WebGLTransformFeedback; drawVAO: VAO; };
  instanceCount = 10000;

  constructor() {

  	super();

  	const devicePixelRatio = Math.min( 2, window.devicePixelRatio || 1 );

  	this.width = window.innerWidth * devicePixelRatio;
  	this.height = window.innerHeight * devicePixelRatio;

  	this.canvas = <HTMLCanvasElement>document.getElementById( "experience" );
  	this.canvas.width = this.width;
  	this.canvas.height = this.height;

  	this.gl = <WebGL2RenderingContext> this.canvas.getContext( "webgl2", { antialias: true } );

  	this.particleShader = new Shader( particlesVertexInstanced, particlesFragmentInstanced, this.gl );

  	const transformFeedbackVaryings = [
  		"tfNewPosition",
  	];

  	this.simulationShader = new Shader( simulationVertex, simulationFragment, this.gl,
  		{
  			transformFeedbackVaryings
  		} );

  	this.simulationShaderLocations = {
  		"tfOldPosition": 0,
  		"tfOldVelocity": 1
  	};

  	this.particleShaderLocations = {
  		"aPosition": 0
  	};

  	this.lightPosition = vec3.fromValues( 0, 10, 0 );

  	this.camera = new CameraFPS(
  		this.width,
  		this.height,
  		vec3.fromValues( 0, 0, 20 ),
  		45,
  		0.01,
  		1000,
  		this.gl,
  	);

  	this.gl.viewport( 0, 0, this.gl.canvas.width, this.gl.canvas.height );
  	this.gl.enable( this.gl.DEPTH_TEST );

  	this.init();


  }

  createTransformFeedback( buffer: WebGLBuffer ) {

  	const tf = this.gl.createTransformFeedback();
  	this.gl.bindTransformFeedback( this.gl.TRANSFORM_FEEDBACK, tf );
  	this.gl.bindBufferBase( this.gl.TRANSFORM_FEEDBACK_BUFFER, 0, buffer );
  	return tf;

  }

  async init() {

  	this.assetsLoaded = true;

  	const positions: number[] = [];
  	const velocities: number[] = [];

  	for ( let i = 0; i < this.instanceCount; i ++ ) {

  		positions.push( ( Math.random() * 2 - 1 ) * 100 );
  		positions.push( ( Math.random() * 2 - 1 ) * 100 );
  		positions.push( - Math.random() * 100 );

  		velocities.push( ( Math.random() * 2 - 1 ) * 1 );
  		velocities.push( ( Math.random() * 2 - 1 ) * 1 );
  		velocities.push( - Math.random() * 1 );

  	}

  	const position1VBO = new VBO( positions, this.gl, this.gl.DYNAMIC_DRAW );
  	const position2VBO = new VBO( positions, this.gl, this.gl.DYNAMIC_DRAW );
  	const velocityBuffer = new VBO( velocities, this.gl, this.gl.STATIC_DRAW );


  	const vaoUpdate1 = new VAO( this.gl );
  	vaoUpdate1.bind();
  	vaoUpdate1.linkAttrib( position1VBO, this.simulationShaderLocations.tfOldPosition, 3, this.gl.FLOAT );
  	vaoUpdate1.linkAttrib( velocityBuffer, this.simulationShaderLocations.tfOldVelocity, 3, this.gl.FLOAT );
  	vaoUpdate1.unbind();

  	const vaoUpdate2 = new VAO( this.gl );
  	vaoUpdate2.bind();
  	vaoUpdate2.linkAttrib( position2VBO, this.simulationShaderLocations.tfOldPosition, 3, this.gl.FLOAT );
  	vaoUpdate2.linkAttrib( velocityBuffer, this.simulationShaderLocations.tfOldVelocity, 3, this.gl.FLOAT );
  	vaoUpdate2.unbind();

  	const vaoDraw1 = new VAO( this.gl );
  	vaoDraw1.bind();
  	vaoDraw1.linkAttrib( position1VBO, this.particleShaderLocations.aPosition, 3, this.gl.FLOAT );
  	vaoDraw1.unbind();

  	const vaoDraw2 = new VAO( this.gl );
  	vaoDraw2.bind();
  	vaoDraw2.linkAttrib( position2VBO, this.particleShaderLocations.aPosition, 3, this.gl.FLOAT );
  	vaoDraw2.unbind();

  	this.tf1 = <WebGLTransformFeedback> this.createTransformFeedback( position1VBO.buffer );
  	this.tf2 = <WebGLTransformFeedback> this.createTransformFeedback( position2VBO.buffer );

  	this.gl.bindBuffer( this.gl.ARRAY_BUFFER, null );
  	this.gl.bindBuffer( this.gl.TRANSFORM_FEEDBACK_BUFFER, null );

  	this.current = {
  		updateVAO: vaoUpdate1,
  		tf: this.tf2,
  		drawVAO: vaoDraw2
  	};

  	this.next = {
  		updateVAO: vaoUpdate2,
  		tf: this.tf1,
  		drawVAO: vaoDraw1
  	};

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

  	this.gl.useProgram( this.simulationShader.program );
  	this.gl.bindVertexArray( this.current.updateVAO.arrayObject );

  	this.gl.enable( this.gl.RASTERIZER_DISCARD );

  	this.gl.bindTransformFeedback( this.gl.TRANSFORM_FEEDBACK, this.current.tf );
  	this.gl.beginTransformFeedback( this.gl.POINTS );

  	this.gl.drawArrays( this.gl.POINTS, 0, this.instanceCount );

  	this.gl.endTransformFeedback();
  	this.gl.bindTransformFeedback( this.gl.TRANSFORM_FEEDBACK, null );

  	this.gl.disable( this.gl.RASTERIZER_DISCARD );

  	const model = mat4.create();

  	this.particleShader.activate();
  	this.gl.bindVertexArray( this.current.drawVAO.arrayObject );

  	this.particleShader.setMatrix4( "projection", this.camera.getProjectionMatrix() );
  	this.particleShader.setMatrix4( "view", this.camera.getViewMatrix() );
  	this.particleShader.setMatrix4( "model", model );

  	this.gl.drawArrays( this.gl.POINTS, 0, this.instanceCount );


  	{

  		const temp = this.current;
  		this.current = this.next;
  		this.next = temp;

  	}

  }

  lateUpdate( elapsed: number, delta: number ) {

  	super.lateUpdate( elapsed, delta );

  }

}
