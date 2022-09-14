

import Base from "@webgl/Base";
import Bolt, { CameraPersp, DYNAMIC_DRAW, FLOAT, IBO, POINTS, Program, STATIC_DRAW, TRIANGLES, VAO, VBO } from "@bolt-webgl/core";

import particlesVertexInstanced from "./shaders/particles/particles.vert";
import particlesFragmentInstanced from "./shaders/particles/particles.frag";

import simulationVertex from "./shaders/simulation/simulation.vert";
import simulationFragment from "./shaders/simulation/simulation.frag";

import { mat4, vec3 } from "gl-matrix";

import Plane from "@/webgl/modules/primitives/Plane";
import Orbit from "@webgl/modules/orbit";

interface TransformFeedbackObject {
	updateVAO: VAO;
	tf: WebGLTransformFeedback;
	drawVAO: VAO;
}

export default class extends Base {

	canvas: HTMLCanvasElement;
	gl: WebGL2RenderingContext;
	particleProgram!: Program;
	lightPosition: vec3;
	camera: CameraPersp;
	assetsLoaded!: boolean;
	simulationProgram!: Program;
	simulationProgramLocations!: { oldPosition: number; oldVelocity: number; oldLifeTime: number; initLifeTime: number; initPosition: number; };
	particleProgramLocations!: { aPosition: number; aOffset: number; aNormal: number; aUV: number; };
	tf1?: WebGLTransformFeedback;
	tf2?: WebGLTransformFeedback;
	current!: TransformFeedbackObject;
	next!: TransformFeedbackObject;
	instanceCount = 80000;
	tfVelocity1?: WebGLTransformFeedback;
	tfVelocity2?: WebGLTransformFeedback;
	meshIBO!: IBO;
	bolt: Bolt;
	orbit: Orbit;
	model = mat4.create();

	constructor() {

		super();

		this.width = window.innerWidth;
		this.height = window.innerHeight;

		this.canvas = <HTMLCanvasElement>document.getElementById( "experience" );
		this.canvas.width = this.width;
		this.canvas.height = this.height;

		this.bolt = Bolt.getInstance();
		this.bolt.init( this.canvas, { antialias: true, dpi: Math.min( 2, window.devicePixelRatio ), powerPreference: "high-performance" } );

		this.gl = this.bolt.getContext();

		this.particleProgram = new Program( particlesVertexInstanced, particlesFragmentInstanced );

		const transformFeedbackVaryings = [
			"newPosition",
			"newVelocity",
			"newLifeTime"
		];

		this.simulationProgram = new Program( simulationVertex, simulationFragment,
			{
				transformFeedbackVaryings
			} );

		this.simulationProgram.activate();
		this.simulationProgram.setFloat( "lifeTime", 4 );
		this.simulationProgram.setFloat( "time", 0 );

		this.simulationProgramLocations = {
			"oldPosition": 0,
			"oldVelocity": 1,
			"oldLifeTime": 2,
			"initPosition": 3,
			"initLifeTime": 4
		};

		this.particleProgramLocations = {
			"aPosition": 0,
			"aOffset": 1,
			"aNormal": 2,
			"aUV": 3
		};

		this.lightPosition = vec3.fromValues( 0, 10, 0 );

		this.camera = new CameraPersp( {
			aspect: this.canvas.width / this.canvas.height,
			fov: 45,
			near: 0.1,
			far: 1000,
			position: vec3.fromValues( 0, 0, 30 ),
			target: vec3.fromValues( 0, 1, 0 ),
		} );

		this.orbit = new Orbit( this.camera );

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

			lifeTimes.push( ( Math.random() + 0.5 ) * 20 );

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
		const meshPositionVBO = new VBO( new Float32Array( particleGeometry.positions ), STATIC_DRAW );
		const meshNormalVBO = new VBO( new Float32Array( particleGeometry.normals ), STATIC_DRAW );
		const meshUVVBO = new VBO( new Float32Array( particleGeometry.uvs ), STATIC_DRAW );

		this.meshIBO = new IBO( new Uint32Array( particleGeometry.indices ) );

		// buffers
		const offset1VBO = new VBO( new Float32Array( offsets ), DYNAMIC_DRAW );
		const offset2VBO = new VBO( new Float32Array( offsets ), DYNAMIC_DRAW );

		const init1VBO = new VBO( new Float32Array( offsets ), DYNAMIC_DRAW );
		const init2VBO = new VBO( new Float32Array( offsets ), DYNAMIC_DRAW );

		const velocity1VBO = new VBO( new Float32Array( velocities ), DYNAMIC_DRAW );
		const velocity2VBO = new VBO( new Float32Array( velocities ), DYNAMIC_DRAW );

		const life1VBO = new VBO( new Float32Array( lifeTimes ), DYNAMIC_DRAW );
		const life2VBO = new VBO( new Float32Array( lifeTimes ), DYNAMIC_DRAW );

		const initLife1VBO = new VBO( new Float32Array( lifeTimes ), DYNAMIC_DRAW );
		const initLife2VBO = new VBO( new Float32Array( lifeTimes ), DYNAMIC_DRAW );

		// create simulation vaos
		const vaoSim1 = new VAO();
		vaoSim1.bind();
		vaoSim1.linkAttrib( offset1VBO, this.simulationProgramLocations.oldPosition, 3, FLOAT, 3 * Float32Array.BYTES_PER_ELEMENT, 0 );
		vaoSim1.linkAttrib( init1VBO, this.simulationProgramLocations.initPosition, 3, FLOAT, 3 * Float32Array.BYTES_PER_ELEMENT, 0 );
		vaoSim1.linkAttrib( velocity1VBO, this.simulationProgramLocations.oldVelocity, 3, FLOAT, 3 * Float32Array.BYTES_PER_ELEMENT, 0 );
		vaoSim1.linkAttrib( life1VBO, this.simulationProgramLocations.oldLifeTime, 1, FLOAT, 1 * Float32Array.BYTES_PER_ELEMENT, 0 );
		vaoSim1.linkAttrib( initLife1VBO, this.simulationProgramLocations.initLifeTime, 1, FLOAT, 1 * Float32Array.BYTES_PER_ELEMENT, 0 );
		vaoSim1.unbind();

		const vaoSim2 = new VAO();
		vaoSim2.bind();
		vaoSim2.linkAttrib( offset2VBO, this.simulationProgramLocations.oldPosition, 3, FLOAT, 3 * Float32Array.BYTES_PER_ELEMENT, 0 );
		vaoSim1.linkAttrib( init2VBO, this.simulationProgramLocations.initPosition, 3, FLOAT, 3 * Float32Array.BYTES_PER_ELEMENT, 0 );
		vaoSim2.linkAttrib( velocity2VBO, this.simulationProgramLocations.oldVelocity, 3, FLOAT, 3 * Float32Array.BYTES_PER_ELEMENT, 0 );
		vaoSim1.linkAttrib( life2VBO, this.simulationProgramLocations.oldLifeTime, 1, FLOAT, 1 * Float32Array.BYTES_PER_ELEMENT, 0 );
		vaoSim2.linkAttrib( initLife2VBO, this.simulationProgramLocations.initLifeTime, 1, FLOAT, 1 * Float32Array.BYTES_PER_ELEMENT, 0 );
		vaoSim2.unbind();

		// create draw vaos
		const vaoDraw1 = new VAO();
		vaoDraw1.bind();
		vaoDraw1.linkAttrib( meshPositionVBO, this.particleProgramLocations.aPosition, 3, FLOAT, 3 * Float32Array.BYTES_PER_ELEMENT, 0 );
		vaoDraw1.linkAttrib( meshNormalVBO, this.particleProgramLocations.aNormal, 3, FLOAT, 3 * Float32Array.BYTES_PER_ELEMENT, 0 );
		vaoDraw1.linkAttrib( offset1VBO, this.particleProgramLocations.aOffset, 3, FLOAT, 3 * Float32Array.BYTES_PER_ELEMENT, 0 );
		vaoDraw1.linkAttrib( meshUVVBO, this.particleProgramLocations.aUV, 2, FLOAT, 2 * Float32Array.BYTES_PER_ELEMENT, 0 );
		this.gl.vertexAttribDivisor( 1, 1 );
		vaoDraw1.unbind();

		const vaoDraw2 = new VAO();
		vaoDraw2.bind();
		vaoDraw2.linkAttrib( meshPositionVBO, this.particleProgramLocations.aPosition, 3, FLOAT, 3 * Float32Array.BYTES_PER_ELEMENT, 0 );
		vaoDraw1.linkAttrib( meshNormalVBO, this.particleProgramLocations.aNormal, 3, FLOAT, 3 * Float32Array.BYTES_PER_ELEMENT, 0 );
		vaoDraw2.linkAttrib( offset2VBO, this.particleProgramLocations.aOffset, 3, FLOAT, 3 * Float32Array.BYTES_PER_ELEMENT, 0 );
		vaoDraw2.linkAttrib( meshUVVBO, this.particleProgramLocations.aUV, 2, FLOAT, 2 * Float32Array.BYTES_PER_ELEMENT, 0 );
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
		this.camera.updateProjection( this.gl.canvas.width / this.gl.canvas.height );

	}

	earlyUpdate( elapsed: number, delta: number ) {

		return;

	}

	update( elapsed: number, delta: number ) {

		if ( ! this.assetsLoaded ) return;

		this.orbit.update();

		this.bolt.setViewPort( 0, 0, this.gl.canvas.width, this.gl.canvas.height );
		this.bolt.clear( 0, 0, 0, 1 );

		{

			this.simulationProgram.activate();
			this.simulationProgram.setFloat( "time", elapsed );


			this.gl.enable( this.gl.RASTERIZER_DISCARD );

			this.gl.bindVertexArray( this.current.updateVAO.arrayObject );

			this.gl.bindTransformFeedback( this.gl.TRANSFORM_FEEDBACK, this.current.tf );
			this.gl.beginTransformFeedback( POINTS );
			this.gl.drawArrays( POINTS, 0, this.instanceCount );
			this.gl.endTransformFeedback();

			this.gl.disable( this.gl.RASTERIZER_DISCARD );
			this.gl.bindTransformFeedback( this.gl.TRANSFORM_FEEDBACK, null );


		}

		{

			this.particleProgram.activate();
			this.gl.bindVertexArray( this.current.drawVAO.arrayObject );

			this.particleProgram.setMatrix4( "projection", this.camera.projection );
			this.particleProgram.setMatrix4( "view", this.camera.view );
			this.particleProgram.setMatrix4( "model", this.model );

			this.meshIBO.bind();
			this.gl.drawElementsInstanced( TRIANGLES, this.meshIBO.count, this.gl.UNSIGNED_INT, 0, this.instanceCount );
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
