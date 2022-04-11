import Base from "@webgl/Base";
import Bolt, { Shader, Transform, VAO, VBO } from "@robsouthgate/bolt-core";

import particlesVertexInstanced from "../../examples/shaders/gpgpu/particles.vert";
import particlesFragmentInstanced from "../../examples/shaders/gpgpu/particles.frag";

import simulationVertex from "../../examples/shaders/gpgpu/simulation/simulation.vert";
import simulationFragment from "../../examples/shaders/gpgpu/simulation/simulation.frag";

import { mat4, vec3, } from "gl-matrix";
import CameraFPS from "../../modules/CameraFPS";

export default class extends Base {

    canvas: HTMLCanvasElement;
    gl: WebGL2RenderingContext;
    particleShader!: Shader;
    lightPosition: vec3;
    camera: CameraFPS;
    assetsLoaded!: boolean;
    cubeTransform!: Transform;
    simulationShader!: Shader;
    simulationShaderLocations!: { oldPosition: number; oldVelocity: number; };
    particleShaderLocations!: { aPosition: number; };
    tf1?: WebGLTransformFeedback;
    tf2?: WebGLTransformFeedback;
    current!: { updateVAO: VAO; tf: WebGLTransformFeedback; drawVAO: VAO; };
    next!: { updateVAO: VAO; tf: WebGLTransformFeedback; drawVAO: VAO; };
    instanceCount = 10000;
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
    	];

    	this.simulationShader = new Shader( simulationVertex, simulationFragment,
    		{
    			transformFeedbackVaryings
    		} );

    	this.simulationShaderLocations = {
    		"oldPosition": 0,
    		"oldVelocity": 1
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
    	);

    	this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
    	this.bolt.enableDepth();

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

    	const position1VBO = new VBO( positions, this.gl.DYNAMIC_DRAW );
    	const position2VBO = new VBO( positions, this.gl.DYNAMIC_DRAW );
    	const velocityBuffer = new VBO( velocities, this.gl.STATIC_DRAW );


    	const vaoUpdate1 = new VAO();
    	vaoUpdate1.bind();
    	vaoUpdate1.linkAttrib( position1VBO, this.simulationShaderLocations.oldPosition, 3, this.gl.FLOAT );
    	vaoUpdate1.linkAttrib( velocityBuffer, this.simulationShaderLocations.oldVelocity, 3, this.gl.FLOAT );
    	vaoUpdate1.unbind();

    	const vaoUpdate2 = new VAO();
    	vaoUpdate2.bind();
    	vaoUpdate2.linkAttrib( position2VBO, this.simulationShaderLocations.oldPosition, 3, this.gl.FLOAT );
    	vaoUpdate2.linkAttrib( velocityBuffer, this.simulationShaderLocations.oldVelocity, 3, this.gl.FLOAT );
    	vaoUpdate2.unbind();

    	const vaoDraw1 = new VAO();
    	vaoDraw1.bind();
    	vaoDraw1.linkAttrib( position1VBO, this.particleShaderLocations.aPosition, 3, this.gl.FLOAT );
    	vaoDraw1.unbind();

    	const vaoDraw2 = new VAO();
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

    	this.bolt.resizeFullScreen();

    	this.camera.resize( this.gl.canvas.width, this.gl.canvas.height );

    }

    earlyUpdate( elapsed: number, delta: number ) {

    	return;

    }

    update( elapsed: number, delta: number ) {

    	if ( ! this.assetsLoaded ) return;



    	this.camera.update( delta );

    	this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
    	this.bolt.clear( 1, 1, 1, 1 );

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

    	this.particleShader.setMatrix4( "projection", this.camera.projection );
    	this.particleShader.setMatrix4( "view", this.camera.view );
    	this.particleShader.setMatrix4( "model", model );

    	this.gl.drawArrays( this.gl.POINTS, 0, this.instanceCount );


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
