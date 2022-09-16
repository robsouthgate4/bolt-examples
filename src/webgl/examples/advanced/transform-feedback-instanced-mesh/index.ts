

import Base from "@webgl/Base";
import Bolt, { CameraPersp, DrawSet, DYNAMIC_DRAW, FLOAT, IBO, Mesh, Program, VAO, VBO } from "@bolt-webgl/core";

import particlesVertexInstanced from "./shaders/particles/particles.vert";
import particlesFragmentInstanced from "./shaders/particles/particles.frag";

import simulationVertex from "./shaders/simulation/simulation.vert";
import simulationFragment from "./shaders/simulation/simulation.frag";

import { mat4, vec3 } from "gl-matrix";

import Plane from "@/webgl/modules/primitives/Plane";
import Orbit from "@webgl/modules/orbit";
import TransformFeedback from "@/webgl/modules/transform-feedback";

interface TransformFeedbackObject {
	updateVAO: VAO;
	tf: WebGLTransformFeedback;
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
	mesh!: Mesh;
	meshB!: Mesh;
	drawSet!: DrawSet;
	transformFeedback!: TransformFeedback;

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

		this.transformFeedback = new TransformFeedback( { bolt: this.bolt, count: this.instanceCount } );

		this.init();


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

		this.mesh = new Mesh( particleGeometry, {
			instanced: true,
			instanceCount: this.instanceCount,
		} );

		// buffers
		const offset1VBO = new VBO( new Float32Array( offsets ), DYNAMIC_DRAW );
		const offset2VBO = new VBO( new Float32Array( offsets ), DYNAMIC_DRAW );

		const velocity1VBO = new VBO( new Float32Array( velocities ), DYNAMIC_DRAW );
		const velocity2VBO = new VBO( new Float32Array( velocities ), DYNAMIC_DRAW );

		const life1VBO = new VBO( new Float32Array( lifeTimes ), DYNAMIC_DRAW );
		const life2VBO = new VBO( new Float32Array( lifeTimes ), DYNAMIC_DRAW );

		const init1VBO = new VBO( new Float32Array( offsets ), DYNAMIC_DRAW );
		const initLife1VBO = new VBO( new Float32Array( lifeTimes ), DYNAMIC_DRAW );

		this.transformFeedback.bindVAOS(
			[
				{
					vbo1: offset1VBO,
					vbo2: offset2VBO,
					attributeLocation: this.simulationProgramLocations.oldPosition,
					size: 3,
					requiresSwap: true
				},
				{
					vbo1: velocity1VBO,
					vbo2: velocity2VBO,
					attributeLocation: this.simulationProgramLocations.oldVelocity,
					size: 3,
					requiresSwap: true
				},
				{
					vbo1: life1VBO,
					vbo2: life2VBO,
					attributeLocation: this.simulationProgramLocations.oldLifeTime,
					size: 1,
					requiresSwap: true
				},
				{
					vbo1: init1VBO,
					vbo2: init1VBO,
					attributeLocation: this.simulationProgramLocations.initPosition,
					size: 3,
					requiresSwap: false
				},
				{
					vbo1: initLife1VBO,
					vbo2: initLife1VBO,
					attributeLocation: this.simulationProgramLocations.initLifeTime,
					size: 1,
					requiresSwap: false
				}
			]
		);

		this.mesh.setVBO( offset1VBO, 3, this.particleProgramLocations.aOffset, FLOAT, 0, 1 );

		this.drawSet = new DrawSet( this.mesh, this.particleProgram );

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
			this.transformFeedback.compute();


		}

		{

			this.bolt.draw( this.drawSet );

		}



	}

	lateUpdate( elapsed: number, delta: number ) {

		return;

	}

}
