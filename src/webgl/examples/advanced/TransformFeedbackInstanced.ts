import Base from "@webgl/Base";
import Shader from "../../core/Shader";


//@ts-ignore
import particlesVertexInstanced from "../../core/shaders/gpgpuInstanced/particles.vert";
//@ts-ignore
import particlesFragmentInstanced from "../../core/shaders/gpgpuInstanced/particles.frag";

//@ts-ignore
import simulationVertex from "../../core/shaders/gpgpuInstanced/simulation/simulation.vert";
//@ts-ignore
import simulationFragment from "../../core/shaders/gpgpuInstanced/simulation/simulation.frag";

import { mat4, vec3, } from "gl-matrix";

import Transform from "../../modules/SceneGraph/Transform";
import ArrayBufferInterleaved from "../../core/ArrayBufferInterleaved";
import CameraFPS from "../../modules/CameraFPS";
import VBO from "../../core/VBO";
import VAO from "../../core/VAO";
import Sphere from "@/webgl/modules/Primitives/Sphere";
import IBO from "@/webgl/core/IBO";
import Camera from "@/webgl/core/Camera";

interface TransformFeedbackObject {
  updateVAO: VAO;
  tf: WebGLTransformFeedback;
  drawVAO: VAO;
}

export default class extends Base {

  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
  particleShader!: Shader;
  lightPosition: vec3;
  camera: Camera;
  assetsLoaded!: boolean;
  cubeTransform!: Transform;
  torusBuffer!: ArrayBufferInterleaved;
  simulationShader!: Shader;
  simulationShaderLocations!: { tfOldPosition: number; tfOldVelocity: number; };
  particleShaderLocations!: { aPosition: number; aOffset: number; aNormal: number; };
  tf1?: WebGLTransformFeedback;
  tf2?: WebGLTransformFeedback;
  current!: TransformFeedbackObject;
  next!: TransformFeedbackObject;
  instanceCount = 5000;
  tfVelocity1?: WebGLTransformFeedback;
  tfVelocity2?: WebGLTransformFeedback;
  meshIBO!: IBO;

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
  		"tfNewVelocity",
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
  		"aPosition": 0,
  		"aOffset": 1,
  		"aNormal": 2
  	};

  	this.lightPosition = vec3.fromValues( 0, 10, 0 );

  	this.camera = new Camera(
  		this.width,
  		this.height,
  		vec3.fromValues( 0, 5, 30 ),
  		45,
  		0.01,
  		1000,
  		this.gl,
  	);

  	this.camera.lookAt( vec3.fromValues( 0, 0, 0 ) );

  	this.gl.viewport( 0, 0, this.gl.canvas.width, this.gl.canvas.height );
  	this.gl.enable( this.gl.DEPTH_TEST );

  	this.init();


  }

  createTransformFeedback( buffer1: WebGLBuffer, buffer2: WebGLBuffer ) {

  	const tf = this.gl.createTransformFeedback();
  	this.gl.bindTransformFeedback( this.gl.TRANSFORM_FEEDBACK, tf );
  	this.gl.bindBufferBase( this.gl.TRANSFORM_FEEDBACK_BUFFER, 0, buffer1 );
  	this.gl.bindBufferBase( this.gl.TRANSFORM_FEEDBACK_BUFFER, 1, buffer2 );
  	return tf;

  }

  async init() {

  	this.assetsLoaded = true;

  	const offsets: number[] = [];
  	const velocities: number[] = [];

  	for ( let i = 0; i < this.instanceCount; i ++ ) {

  		offsets.push( ( Math.random() * 10 ) - 5 );
  		offsets.push( 0 );
  		offsets.push( ( Math.random() * 50 ) - 25 );

  		velocities.push( Math.random() * 2 - 1 );
  		velocities.push( Math.random() );
  		velocities.push( 0 );

  	}

  	// create vbos
  	const sphereGeometry = new Sphere( { radius: 0.6, widthSegments: 6, heightSegments: 6 } );

  	// mesh vbo
  	const meshPositionVBO = new VBO( sphereGeometry.positions, this.gl, this.gl.STATIC_DRAW );
  	const meshNormalVBO = new VBO( sphereGeometry.normals, this.gl, this.gl.STATIC_DRAW );
  	this.meshIBO = new IBO( sphereGeometry.indices, this.gl );

  	// buffers for position and velocity
  	const offset1VBO = new VBO( offsets, this.gl, this.gl.DYNAMIC_DRAW );
  	const offset2VBO = new VBO( offsets, this.gl, this.gl.DYNAMIC_DRAW );
  	const velocity1VBO = new VBO( velocities, this.gl, this.gl.DYNAMIC_DRAW );
  	const velocity2VBO = new VBO( velocities, this.gl, this.gl.DYNAMIC_DRAW );

  	// create simulation vaos
  	const vaoSim1 = new VAO( this.gl );
  	vaoSim1.bind();
  	vaoSim1.linkAttrib( offset1VBO, this.simulationShaderLocations.tfOldPosition, 3, this.gl.FLOAT );
  	vaoSim1.linkAttrib( velocity1VBO, this.simulationShaderLocations.tfOldVelocity, 3, this.gl.FLOAT );
  	vaoSim1.unbind();

  	const vaoSim2 = new VAO( this.gl );
  	vaoSim2.bind();
  	vaoSim2.linkAttrib( offset2VBO, this.simulationShaderLocations.tfOldPosition, 3, this.gl.FLOAT );
  	vaoSim2.linkAttrib( velocity2VBO, this.simulationShaderLocations.tfOldVelocity, 3, this.gl.FLOAT );
  	vaoSim2.unbind();

  	// create draw vaos
  	const vaoDraw1 = new VAO( this.gl );
  	vaoDraw1.bind();
  	vaoDraw1.linkAttrib( meshPositionVBO, this.particleShaderLocations.aPosition, 3, this.gl.FLOAT, 3 * Float32Array.BYTES_PER_ELEMENT, 0 * Float32Array.BYTES_PER_ELEMENT );
  	vaoDraw1.linkAttrib( meshNormalVBO, this.particleShaderLocations.aNormal, 3, this.gl.FLOAT, 3 * Float32Array.BYTES_PER_ELEMENT, 0 * Float32Array.BYTES_PER_ELEMENT );
  	vaoDraw1.linkAttrib( offset1VBO, this.particleShaderLocations.aOffset, 3, this.gl.FLOAT, 3 * Float32Array.BYTES_PER_ELEMENT, 0 );
  	this.gl.vertexAttribDivisor( 1, 1 );
  	vaoDraw1.unbind();

  	const vaoDraw2 = new VAO( this.gl );
  	vaoDraw2.bind();
  	vaoDraw2.linkAttrib( meshPositionVBO, this.particleShaderLocations.aPosition, 3, this.gl.FLOAT, 3 * Float32Array.BYTES_PER_ELEMENT, 0 );
  	vaoDraw1.linkAttrib( meshPositionVBO, this.particleShaderLocations.aNormal, 3, this.gl.FLOAT, 3 * Float32Array.BYTES_PER_ELEMENT, 0 * Float32Array.BYTES_PER_ELEMENT );
  	vaoDraw2.linkAttrib( offset2VBO, this.particleShaderLocations.aOffset, 3, this.gl.FLOAT, 3 * Float32Array.BYTES_PER_ELEMENT, 0 );
  	this.gl.vertexAttribDivisor( 1, 1 );
  	vaoDraw2.unbind();

  	// create transform feedback objects
  	this.tf1 = <WebGLTransformFeedback> this.createTransformFeedback( offset1VBO.buffer, velocity1VBO.buffer );
  	this.tf2 = <WebGLTransformFeedback> this.createTransformFeedback( offset2VBO.buffer, velocity2VBO.buffer );
  	this.gl.bindBuffer( this.gl.TRANSFORM_FEEDBACK_BUFFER, null );

  	// create current / next ojects ready for swap
  	this.current = {
  		updateVAO: vaoSim1,
  		tf: this.tf2,
  		drawVAO: vaoDraw2
  	};

  	this.next = {
  		updateVAO: vaoSim2,
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

  	this.camera.update( );

  	this.gl.viewport( 0, 0, this.gl.canvas.width, this.gl.canvas.height );
  	this.gl.clearColor( 0, 0, 0, 0 );
  	this.gl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT );

  	{

  		this.gl.useProgram( this.simulationShader.program );
  		this.gl.bindVertexArray( this.current.updateVAO.arrayObject );

  		this.gl.enable( this.gl.RASTERIZER_DISCARD );

  		this.gl.bindTransformFeedback( this.gl.TRANSFORM_FEEDBACK, this.current.tf );
  		this.gl.beginTransformFeedback( this.gl.POINTS );

  		this.gl.drawArrays( this.gl.POINTS, 0, this.instanceCount );

  		this.gl.endTransformFeedback();
  		this.gl.bindTransformFeedback( this.gl.TRANSFORM_FEEDBACK, null );

  		this.gl.disable( this.gl.RASTERIZER_DISCARD );

  	}

  	{

  		const model = mat4.create();

  		this.particleShader.activate();
  		this.gl.bindVertexArray( this.current.drawVAO.arrayObject );

  		this.particleShader.setMatrix4( "projection", this.camera.getProjectionMatrix() );
  		this.particleShader.setMatrix4( "view", this.camera.getViewMatrix() );
  		this.particleShader.setMatrix4( "model", model );

  		this.meshIBO.bind();
  		this.gl.drawElementsInstanced( this.gl.TRIANGLES, this.meshIBO.count, this.gl.UNSIGNED_SHORT, 0, this.instanceCount );
  		this.meshIBO.unbind();

  	}

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
