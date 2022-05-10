

import Base from "@webgl/Base";
import Bolt, { Shader, Transform, Mesh, FBO, Node, Batch, CameraPersp } from "@bolt-webgl/core";

import defaultVertexInstanced from "./shaders/instanced/instanced.vert";
import defaultFragmentInstanced from "./shaders/instanced/instanced.frag";

import depthVertexInstanced from "./shaders/depth/depth.vert";
import depthFragmentInstanced from "./shaders/depth/depth.frag";

import { mat4, quat, vec2, vec3, } from "gl-matrix";
import Post from "@/webgl/modules/post";
import RenderPass from "@/webgl/modules/post/passes/RenderPass";
import DOFPass from "@/webgl/modules/post/passes/DOFPass";
import FXAAPass from "@/webgl/modules/post/passes/FXAAPass";
import GLTFLoader from "@/webgl/modules/gltf-Loader";

export default class extends Base {

    canvas: HTMLCanvasElement;
    colorShader: Shader;
    camera: CameraPersp;
    assetsLoaded!: boolean;
    cubeTransform!: Transform;
    torusBuffer!: Mesh;
    toruseGLTFBuffer!: Mesh;
    bolt: Bolt;
    post: Post;
    renderPass!: RenderPass;
    fxaa!: FXAAPass;
    dofPass!: DOFPass;
    depthShader: Shader;
    depthFBO!: FBO;
    gl: WebGL2RenderingContext;

    constructor() {

    	super();

    	const devicePixelRatio = Math.min( 2, window.devicePixelRatio || 1 );

    	this.width = window.innerWidth * devicePixelRatio;
    	this.height = window.innerHeight * devicePixelRatio;

    	this.canvas = <HTMLCanvasElement>document.getElementById( "experience" );
    	this.canvas.width = this.width;
    	this.canvas.height = this.height;

    	this.camera = new CameraPersp( {
    		aspect: this.canvas.width / this.canvas.height,
    		fov: 45,
    		near: 0.1,
    		far: 1000,
    		position: vec3.fromValues( 0, 5, 10 ),
    		target: vec3.fromValues( 0, 0, - 50 ),
    	} );

    	this.bolt = Bolt.getInstance();
    	this.bolt.init( this.canvas, { antialias: true, dpi: 2 } );
    	this.bolt.setCamera( this.camera );
    	this.gl = this.bolt.getContext();

    	this.post = new Post( this.bolt );

    	this.depthShader = new Shader( depthVertexInstanced, depthFragmentInstanced );
    	this.colorShader = new Shader( defaultVertexInstanced, defaultFragmentInstanced );

    	this.camera.lookAt( vec3.fromValues( 0, 0, - 50 ) );

    	this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
    	this.bolt.enableDepth();

    	this.init();


    }

    async init() {

    	this.depthFBO = new FBO( { width: this.canvas.width, height: this.canvas.height, depth: true } );

    	this.dofPass = new DOFPass( this.bolt, {
    		width: this.width,
    		height: this.height
    	} ).setEnabled( true );

    	this.post.add( this.dofPass, true );

    	// set shader uniforms
    	this.depthShader.activate();
    	this.depthShader.setVector2( "cameraPlanes", vec2.fromValues( this.camera.near, this.camera.far ) );

    	this.dofPass.shader.activate();
    	this.dofPass.shader.setTexture( "depthMap", this.depthFBO.targetTexture );
    	this.dofPass.shader.setFloat( "focus", - 3 );
    	this.dofPass.shader.setFloat( "aperture", 12 * 0.0001 );
    	this.dofPass.shader.setFloat( "maxBlur", 6.0 );
    	this.dofPass.shader.setFloat( "aspect", this.gl.canvas.width / this.gl.canvas.height );

    	const instanceCount = 1000;

    	const instanceMatrices: mat4[] = [];

    	for ( let i = 0; i < instanceCount; i ++ ) {

    		const x = ( Math.random() * 2 - 1 ) * 50;
    		const y = ( Math.random() * 2 - 1 ) * 20;
    		const z = Math.random() * 100;

    		const tempTranslation = vec3.fromValues( x, y, - z );

    		const tempQuat = quat.create();
    		const tempRotation = quat.fromEuler( tempQuat, Math.random() * 360, Math.random() * 360, Math.random() * 360 );
    		const tempScale = vec3.fromValues( 1, 1, 1 );

    		const translation = mat4.create();
    		mat4.fromTranslation( translation, tempTranslation );

    		const rotation = mat4.create();
    		mat4.fromQuat( rotation, tempRotation );

    		const scale = mat4.create();
    		mat4.fromScaling( scale, tempScale );

    		const combined = mat4.create();
    		mat4.multiply( combined, translation, rotation );
    		mat4.multiply( combined, combined, scale );

    		instanceMatrices.push( combined );

    	}

    	const gltfLoader = new GLTFLoader( this.bolt );

    	const gltf = await gltfLoader.loadGLTF( "/static/models/gltf/", "torus.gltf" );

    	if ( ! gltf ) return;

    	this.assetsLoaded = true;

    	if ( gltf.scenes ) {

    		for ( const scene of gltf.scenes ) {

    			scene.root.traverse( ( node: Node ) => {

    				if ( node.name === "Torus" ) {

    					const batch = <Batch>node.children[ 0 ];

    					const { positions, normals, uvs, indices } = batch.mesh;

    				    this.torusBuffer = new Mesh( {
    						positions,
    						normals,
    						uvs,
    						indices,
    					}, {
    						instanceCount,
    						instanced: true,
    						instanceMatrices
    					} );

    				}

    			} );

    		}

    	}

    	this.resize();

    }

    resize() {

    	this.bolt.resizeFullScreen();
    	this.camera.updateProjection( this.canvas.width / this.canvas.height );
    	this.post.resize( this.gl.canvas.width, this.gl.canvas.height );
    	this.depthFBO.resize( this.gl.canvas.width, this.gl.canvas.height );

    }

    earlyUpdate( elapsed: number, delta: number ) {

    	return;

    }

    drawInstances( shader: Shader, elapsed: number ) {

    	this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
    	this.bolt.clear( 1, 1, 1, 1 );

    	shader.activate();
    	shader.setVector3( "viewPosition", this.camera.position );
    	shader.setFloat( "time", elapsed );
    	shader.setMatrix4( "projection", this.camera.projection );
    	shader.setMatrix4( "view", this.camera.view );

    	this.torusBuffer.draw( shader );

    }

    update( elapsed: number, delta: number ) {

    	if ( ! this.assetsLoaded ) return;

    	{ // Draw depth shaded to depth framebuffer

    		this.depthFBO.bind();
    		this.bolt.enableDepth();
    		this.drawInstances( this.depthShader, elapsed );
    		this.depthFBO.unbind();
    		this.bolt.disableDepth();

    	}

    	{ // draw post process stack and set depth map

    		this.post.begin();
    		this.drawInstances( this.colorShader, elapsed );
    		this.post.end();

    	}


    }

    lateUpdate( elapsed: number, delta: number ) {

    	return;

    }

}
