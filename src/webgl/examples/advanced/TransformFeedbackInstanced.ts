import Base from "@webgl/Base";
import Bolt, { Camera, IBO, Shader, VAO, VBO } from "@robsouthgate/bolt-core";

import particlesVertexInstanced from "../../examples/shaders/gpgpuInstanced/particles.vert";
import particlesFragmentInstanced from "../../examples/shaders/gpgpuInstanced/particles.frag";

import simulationVertex from "../../examples/shaders/gpgpuInstanced/simulation/simulation.vert";
import simulationFragment from "../../examples/shaders/gpgpuInstanced/simulation/simulation.frag";

import { mat4, vec3, } from "gl-matrix";

import Plane from "@/webgl/modules/Primitives/Plane";
import CameraFPS from "@/webgl/modules/CameraFPS";

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
    camera: CameraFPS;
    assetsLoaded!: boolean;
    simulationShader!: Shader;
    simulationShaderLocations!: { oldPosition: number; oldVelocity: number; startTime: number; };
    particleShaderLocations!: { aPosition: number; aOffset: number; aNormal: number; aUV: number; };
    tf1?: WebGLTransformFeedback;
    tf2?: WebGLTransformFeedback;
    current!: TransformFeedbackObject;
    next!: TransformFeedbackObject;
    instanceCount = 80000;
    tfVelocity1?: WebGLTransformFeedback;
    tfVelocity2?: WebGLTransformFeedback;
    meshIBO!: IBO;
    bolt: Bolt;

    constructor() {

    	super();

    	const devicePixelRatio = Math.min( 2, window.devicePixelRatio || 1 );

    	this.width = window.innerWidth * devicePixelRatio;
    	this.height = window.innerHeight * devicePixelRatio;

    	this.canvas = <HTMLCanvasElement>document.getElementById( "experience" );
    	this.canvas.width = this.width;
    	this.canvas.height = this.height;

    	this.bolt = Bolt.getInstance();
    	this.bolt.init( this.canvas, { antialias: true } );

    	this.gl = this.bolt.getContext();

    	this.particleShader = new Shader( particlesVertexInstanced, particlesFragmentInstanced );

    	const transformFeedbackVaryings = [
    		"newPosition",
    		"newVelocity",
    	];

    	this.simulationShader = new Shader( simulationVertex, simulationFragment,
    		{
    			transformFeedbackVaryings
    		} );

    	this.simulationShader.activate();
    	this.simulationShader.setFloat( "lifeTime", 4 );
    	this.simulationShader.setFloat( "time", 0 );

    	this.simulationShaderLocations = {
    		"oldPosition": 0,
    		"oldVelocity": 1,
    		"startTime": 2
    	};

    	this.particleShaderLocations = {
    		"aPosition": 0,
    		"aOffset": 1,
    		"aNormal": 2,
    		"aUV": 3
    	};

    	this.lightPosition = vec3.fromValues( 0, 10, 0 );

    	this.camera = new CameraFPS(
    		this.width,
    		this.height,
    		vec3.fromValues( 0, 0, 25 ),
    		45,
    		0.01,
    		1000
    	);

    	this.camera.lookAt( vec3.fromValues( 0, 0, 0 ) );

    	this.bolt.setCamera( this.camera );

    	this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
    	this.bolt.enableDepth();

    	this.init();


    }

    createTransformFeedback( buffer1: WebGLBuffer, buffer2: WebGLBuffer, buffer3: WebGLBuffer ) {

    	const tf = this.gl.createTransformFeedback();
    	this.gl.bindTransformFeedback( this.gl.TRANSFORM_FEEDBACK, tf );
    	this.gl.bindBufferBase( this.gl.TRANSFORM_FEEDBACK_BUFFER, 0, buffer1 );
    	this.gl.bindBufferBase( this.gl.TRANSFORM_FEEDBACK_BUFFER, 1, buffer2 );
    	this.gl.bindBufferBase( this.gl.TRANSFORM_FEEDBACK_BUFFER, 2, buffer3 );
    	return tf;

    }

    async init() {

    	this.assetsLoaded = true;

    	const offsets: number[] = [];
    	const velocities: number[] = [];
    	const startTimes: number[] = [];

    	for ( let i = 0; i < this.instanceCount; i ++ ) {

    		startTimes.push( Math.random() * 100 );

    		offsets.push( ( Math.random() * 2 - 1 ) * 3 );
    		offsets.push( ( Math.random() * 2 - 1 ) * 3 );
    		offsets.push( ( Math.random() * 2 - 1 ) * 3 );

    		velocities.push( 0 );
    		velocities.push( 0 );
    		velocities.push( 0 );

    	}

    	// create vbos
    	const particleGeometry = new Plane( { width: 0.03, height: 0.03 } );

    	// mesh vbo
    	const meshPositionVBO = new VBO( particleGeometry.positions, this.gl.STATIC_DRAW );
    	const meshNormalVBO = new VBO( particleGeometry.normals, this.gl.STATIC_DRAW );
    	const meshUVVBO = new VBO( particleGeometry.uvs, this.gl.STATIC_DRAW );

    	this.meshIBO = new IBO( particleGeometry.indices );

    	// buffers
    	const offset1VBO = new VBO( offsets, this.gl.DYNAMIC_DRAW );
    	const offset2VBO = new VBO( offsets, this.gl.DYNAMIC_DRAW );

    	const velocity1VBO = new VBO( velocities, this.gl.DYNAMIC_DRAW );
    	const velocity2VBO = new VBO( velocities, this.gl.DYNAMIC_DRAW );

    	const startTime1VBO = new VBO( startTimes, this.gl.DYNAMIC_DRAW );
    	const startTime2VBO = new VBO( startTimes, this.gl.DYNAMIC_DRAW );

    	// create simulation vaos
    	const vaoSim1 = new VAO();
    	vaoSim1.bind();
    	vaoSim1.linkAttrib( offset1VBO, this.simulationShaderLocations.oldPosition, 3, this.gl.FLOAT );
    	vaoSim1.linkAttrib( velocity1VBO, this.simulationShaderLocations.oldVelocity, 3, this.gl.FLOAT );
    	vaoSim1.linkAttrib( startTime1VBO, this.simulationShaderLocations.startTime, 1, this.gl.FLOAT );
    	vaoSim1.unbind();

    	const vaoSim2 = new VAO();
    	vaoSim2.bind();
    	vaoSim2.linkAttrib( offset2VBO, this.simulationShaderLocations.oldPosition, 3, this.gl.FLOAT );
    	vaoSim2.linkAttrib( velocity2VBO, this.simulationShaderLocations.oldVelocity, 3, this.gl.FLOAT );
    	vaoSim1.linkAttrib( startTime2VBO, this.simulationShaderLocations.startTime, 1, this.gl.FLOAT );
    	vaoSim2.unbind();

    	// create draw vaos
    	const vaoDraw1 = new VAO();
    	vaoDraw1.bind();
    	vaoDraw1.linkAttrib( meshPositionVBO, this.particleShaderLocations.aPosition, 3, this.gl.FLOAT, 3 * Float32Array.BYTES_PER_ELEMENT, 0 );
    	vaoDraw1.linkAttrib( meshNormalVBO, this.particleShaderLocations.aNormal, 3, this.gl.FLOAT, 3 * Float32Array.BYTES_PER_ELEMENT, 0 );
    	vaoDraw1.linkAttrib( offset1VBO, this.particleShaderLocations.aOffset, 3, this.gl.FLOAT, 3 * Float32Array.BYTES_PER_ELEMENT, 0 );
    	vaoDraw1.linkAttrib( meshUVVBO, this.particleShaderLocations.aUV, 2, this.gl.FLOAT, 2 * Float32Array.BYTES_PER_ELEMENT, 0 );
    	this.gl.vertexAttribDivisor( 1, 1 );
    	vaoDraw1.unbind();

    	const vaoDraw2 = new VAO();
    	vaoDraw2.bind();
    	vaoDraw2.linkAttrib( meshPositionVBO, this.particleShaderLocations.aPosition, 3, this.gl.FLOAT, 3 * Float32Array.BYTES_PER_ELEMENT, 0 );
    	vaoDraw1.linkAttrib( meshPositionVBO, this.particleShaderLocations.aNormal, 3, this.gl.FLOAT, 3 * Float32Array.BYTES_PER_ELEMENT, 0 );
    	vaoDraw2.linkAttrib( offset2VBO, this.particleShaderLocations.aOffset, 3, this.gl.FLOAT, 3 * Float32Array.BYTES_PER_ELEMENT, 0 );
    	vaoDraw2.linkAttrib( meshUVVBO, this.particleShaderLocations.aUV, 2, this.gl.FLOAT, 2 * Float32Array.BYTES_PER_ELEMENT, 0 );
    	this.gl.vertexAttribDivisor( 1, 1 );
    	vaoDraw2.unbind();

    	// create transform feedback objects
    	this.tf1 = <WebGLTransformFeedback> this.createTransformFeedback( offset1VBO.buffer, velocity1VBO.buffer, startTime1VBO.buffer );
    	this.tf2 = <WebGLTransformFeedback> this.createTransformFeedback( offset2VBO.buffer, velocity2VBO.buffer, startTime2VBO.buffer );
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

    	this.bolt.resizeFullScreen();

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

    	{

    		this.simulationShader.activate();
    		this.simulationShader.setFloat( "time", elapsed );

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
