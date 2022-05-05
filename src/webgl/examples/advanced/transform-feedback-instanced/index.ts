

import Base from "@webgl/Base";
import Bolt, { DYNAMIC_DRAW, FLOAT, IBO, POINTS, Shader, STATIC_DRAW, TRIANGLES, UNSIGNED_SHORT, VAO, VBO } from "@bolt-webgl/core";

import particlesVertexInstanced from "./shaders/particles/particles.vert";
import particlesFragmentInstanced from "./shaders/particles/particles.frag";

import simulationVertex from "./shaders/simulation/simulation.vert";
import simulationFragment from "./shaders/simulation/simulation.frag";

import { mat4, vec3 } from "gl-matrix";

import Plane from "@/webgl/modules/Primitives/Plane";
import CameraArcball from "@/webgl/modules/CameraArcball";

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
    camera: CameraArcball;
    assetsLoaded!: boolean;
    simulationShader!: Shader;
    simulationShaderLocations!: { oldPosition: number; oldVelocity: number; oldLifeTime: number; initLifeTime: number; initPosition: number; };
    particleShaderLocations!: { aPosition: number; aOffset: number; aNormal: number; aUV: number; };
    tf1?: WebGLTransformFeedback;
    tf2?: WebGLTransformFeedback;
    current!: TransformFeedbackObject;
    next!: TransformFeedbackObject;
    instanceCount = 100000;
    tfVelocity1?: WebGLTransformFeedback;
    tfVelocity2?: WebGLTransformFeedback;
    meshIBO!: IBO;
    bolt: Bolt;

    constructor() {

    	super();

    	this.width = window.innerWidth;
    	this.height = window.innerHeight;

    	this.canvas = <HTMLCanvasElement>document.getElementById( "experience" );
    	this.canvas.width = this.width;
    	this.canvas.height = this.height;

    	this.bolt = Bolt.getInstance();
    	this.bolt.init( this.canvas, { antialias: true, dpi: 2 } );

    	this.gl = this.bolt.getContext();

    	this.particleShader = new Shader( particlesVertexInstanced, particlesFragmentInstanced );

    	const transformFeedbackVaryings = [
    		"newPosition",
    		"newVelocity",
    		"newLifeTime"
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
    		"oldLifeTime": 2,
    		"initPosition": 3,
    		"initLifeTime": 4
    	};

    	this.particleShaderLocations = {
    		"aPosition": 0,
    		"aOffset": 1,
    		"aNormal": 2,
    		"aUV": 3
    	};

    	this.lightPosition = vec3.fromValues( 0, 10, 0 );

    	this.camera = new CameraArcball(
    		this.width,
    		this.height,
    		vec3.fromValues( 0, 0, 25 ),
    		vec3.fromValues( 0, 1, 0 ),
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
    	const lifeTimes: number[] = [];

    	for ( let i = 0; i < this.instanceCount; i ++ ) {

    		lifeTimes.push( ( Math.random() + 1 ) * 20 );

    		offsets.push( ( Math.random() * 2 - 1 ) * 5 );
    		offsets.push( ( Math.random() * 2 - 1 ) * 5 );
    		offsets.push( ( Math.random() * 2 - 1 ) * 5 );

    		velocities.push( 0 );
    		velocities.push( 0 );
    		velocities.push( 0 );

    	}

    	// create vbos
    	const particleGeometry = new Plane( { width: 0.05, height: 0.05 } );

    	// mesh vbo
    	const meshPositionVBO = new VBO( particleGeometry.positions, STATIC_DRAW );
    	const meshNormalVBO = new VBO( particleGeometry.normals, STATIC_DRAW );
    	const meshUVVBO = new VBO( particleGeometry.uvs, STATIC_DRAW );

    	this.meshIBO = new IBO( particleGeometry.indices );

    	// buffers
    	const offset1VBO = new VBO( offsets, DYNAMIC_DRAW );
    	const offset2VBO = new VBO( offsets, DYNAMIC_DRAW );

    	const init1VBO = new VBO( offsets, DYNAMIC_DRAW );
    	const init2VBO = new VBO( offsets, DYNAMIC_DRAW );

    	const velocity1VBO = new VBO( velocities, DYNAMIC_DRAW );
    	const velocity2VBO = new VBO( velocities, DYNAMIC_DRAW );

    	const life1VBO = new VBO( lifeTimes, DYNAMIC_DRAW );
    	const life2VBO = new VBO( lifeTimes, DYNAMIC_DRAW );

    	const initLife1VBO = new VBO( lifeTimes, DYNAMIC_DRAW );
    	const initLife2VBO = new VBO( lifeTimes, DYNAMIC_DRAW );

    	// create simulation vaos
    	const vaoSim1 = new VAO();
    	vaoSim1.bind();
    	vaoSim1.linkAttrib( offset1VBO, this.simulationShaderLocations.oldPosition, 3, FLOAT );
    	vaoSim1.linkAttrib( init1VBO, this.simulationShaderLocations.initPosition, 3, FLOAT );
    	vaoSim1.linkAttrib( velocity1VBO, this.simulationShaderLocations.oldVelocity, 3, FLOAT );
    	vaoSim1.linkAttrib( life1VBO, this.simulationShaderLocations.oldLifeTime, 1, FLOAT );
    	vaoSim1.linkAttrib( initLife1VBO, this.simulationShaderLocations.initLifeTime, 1, FLOAT );
    	vaoSim1.unbind();

    	const vaoSim2 = new VAO();
    	vaoSim2.bind();
    	vaoSim2.linkAttrib( offset2VBO, this.simulationShaderLocations.oldPosition, 3, FLOAT );
    	vaoSim1.linkAttrib( init2VBO, this.simulationShaderLocations.initPosition, 3, FLOAT );
    	vaoSim2.linkAttrib( velocity2VBO, this.simulationShaderLocations.oldVelocity, 3, FLOAT );
    	vaoSim1.linkAttrib( life2VBO, this.simulationShaderLocations.oldLifeTime, 1, FLOAT );
    	vaoSim2.linkAttrib( initLife2VBO, this.simulationShaderLocations.initLifeTime, 1, FLOAT );
    	vaoSim2.unbind();

    	// create draw vaos
    	const vaoDraw1 = new VAO();
    	vaoDraw1.bind();
    	vaoDraw1.linkAttrib( meshPositionVBO, this.particleShaderLocations.aPosition, 3, FLOAT, 3 * Float32Array.BYTES_PER_ELEMENT, 0 );
    	vaoDraw1.linkAttrib( meshNormalVBO, this.particleShaderLocations.aNormal, 3, FLOAT, 3 * Float32Array.BYTES_PER_ELEMENT, 0 );
    	vaoDraw1.linkAttrib( offset1VBO, this.particleShaderLocations.aOffset, 3, FLOAT, 3 * Float32Array.BYTES_PER_ELEMENT, 0 );
    	vaoDraw1.linkAttrib( meshUVVBO, this.particleShaderLocations.aUV, 2, FLOAT, 2 * Float32Array.BYTES_PER_ELEMENT, 0 );
    	this.gl.vertexAttribDivisor( 1, 1 );
    	vaoDraw1.unbind();

    	const vaoDraw2 = new VAO();
    	vaoDraw2.bind();
    	vaoDraw2.linkAttrib( meshPositionVBO, this.particleShaderLocations.aPosition, 3, FLOAT, 3 * Float32Array.BYTES_PER_ELEMENT, 0 );
    	vaoDraw1.linkAttrib( meshPositionVBO, this.particleShaderLocations.aNormal, 3, FLOAT, 3 * Float32Array.BYTES_PER_ELEMENT, 0 );
    	vaoDraw2.linkAttrib( offset2VBO, this.particleShaderLocations.aOffset, 3, FLOAT, 3 * Float32Array.BYTES_PER_ELEMENT, 0 );
    	vaoDraw2.linkAttrib( meshUVVBO, this.particleShaderLocations.aUV, 2, FLOAT, 2 * Float32Array.BYTES_PER_ELEMENT, 0 );
    	this.gl.vertexAttribDivisor( 1, 1 );
    	vaoDraw2.unbind();

    	// create transform feedback objects
    	this.tf1 = <WebGLTransformFeedback> this.createTransformFeedback( offset1VBO.buffer, velocity1VBO.buffer, life1VBO.buffer );
    	this.tf2 = <WebGLTransformFeedback> this.createTransformFeedback( offset2VBO.buffer, velocity2VBO.buffer, life2VBO.buffer );
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

    	return;

    }

    update( elapsed: number, delta: number ) {

    	if ( ! this.assetsLoaded ) return;



    	this.camera.update();

    	this.bolt.setViewPort( 0, 0, this.gl.canvas.width, this.gl.canvas.height );
    	this.bolt.clear( 0, 0, 0, 1 );

    	{

    		this.simulationShader.activate();
    		this.simulationShader.setFloat( "time", elapsed );

    		this.gl.bindVertexArray( this.current.updateVAO.arrayObject );

    		this.gl.enable( this.gl.RASTERIZER_DISCARD );

    		this.gl.bindTransformFeedback( this.gl.TRANSFORM_FEEDBACK, this.current.tf );
    		this.gl.beginTransformFeedback( POINTS );

    		this.gl.drawArrays( POINTS, 0, this.instanceCount );

    		this.gl.endTransformFeedback();
    		this.gl.bindTransformFeedback( this.gl.TRANSFORM_FEEDBACK, null );

    		this.gl.disable( this.gl.RASTERIZER_DISCARD );

    	}

    	{

    		const model = mat4.create();

    		this.particleShader.activate();
    		this.gl.bindVertexArray( this.current.drawVAO.arrayObject );

    		this.particleShader.setMatrix4( "projection", this.camera.projection );
    		this.particleShader.setMatrix4( "view", this.camera.view );
    		this.particleShader.setMatrix4( "model", model );

    		this.meshIBO.bind();
    		this.gl.drawElementsInstanced( TRIANGLES, this.meshIBO.count, UNSIGNED_SHORT, 0, this.instanceCount );
    		this.meshIBO.unbind();

    	}

    	{

    		const temp = this.current;
    		this.current = this.next;
    		this.next = temp;

    	}

    }

    lateUpdate( elapsed: number, delta: number ) {

    	return;

    }

}
