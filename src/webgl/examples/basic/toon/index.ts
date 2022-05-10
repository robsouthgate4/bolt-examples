

import Base from "@webgl/Base";
import Bolt, { Shader, Node, Batch, FBO, Texture, COLOR_ATTACHMENT0, RBO, Mesh, NEAREST, TextureCube, CameraPersp } from "@bolt-webgl/core";

import FXAAPass from "@/webgl/modules/post/passes/FXAAPass";
import geometryVertex from "./shaders/geometry/geometry.vert";
import geometryFragment from "./shaders/geometry/geometry.frag";
import compositionVertex from "./shaders/composition/composition.vert";
import compositionFragment from "./shaders/composition/composition.frag";

import { vec2, vec3, } from "gl-matrix";
import CameraArcball from "@webgl/modules/CameraArcball";
import GLTFLoader from "@/webgl/modules/gltf-Loader";
import { GlTf } from "@/webgl/modules/gltf-Loader/types/GLTF";
import Post from "@/webgl/modules/post/Post";
import Axis from "@/webgl/modules/batches/axis";
import Floor from "@/webgl/modules/batches/floor";
import Cube from "@/webgl/modules/primitives/Cube";
import ShaderPass from "@/webgl/modules/post/passes/ShaderPass";

export default class extends Base {

    canvas: HTMLCanvasElement;
    bodyShader!: Shader;
    eyesShader!: Shader;
    camera: CameraPersp;
    assetsLoaded?: boolean;
    bolt: Bolt;
    gltf!: GlTf;
    post!: Post;
    fxaa!: FXAAPass;
    gl: WebGL2RenderingContext;
    axis!: Axis;
    floor!: Floor;
    gBuffer: FBO;
    normalTexture: Texture;
    geometryShader: Shader;
    gBufferRBO: RBO;
    cubeBatch!: Batch;
    comp: ShaderPass;
    compShader: Shader;
    cubeTexture!: TextureCube;
    depthTexture: Texture;
    uvTexture: Texture;
    arcball: CameraArcball;

    constructor() {

    	super();

    	this.width = window.innerWidth;
    	this.height = window.innerHeight;

    	this.canvas = <HTMLCanvasElement>document.getElementById( "experience" );
    	this.canvas.width = this.width;
    	this.canvas.height = this.height;

    	this.camera = new CameraPersp( {
    		aspect: this.canvas.width / this.canvas.height,
    		fov: 45,
    		near: 0.1,
    		far: 1000,
    		position: vec3.fromValues( 0, 3, 6 ),
    		target: vec3.fromValues( 0, 0.5, 0 ),
    	} );

    	this.arcball = new CameraArcball( this.camera, 4, 0.08 );

    	this.bolt = Bolt.getInstance();
    	this.bolt.init( this.canvas, { antialias: true, dpi: 2 } );
    	this.bolt.setCamera( this.camera );

    	this.gl = this.bolt.getContext();

    	this.geometryShader = new Shader( geometryVertex, geometryFragment );
    	this.geometryShader.activate();
    	this.geometryShader.setVector2( "cameraPlanes", vec2.fromValues( this.camera.near, this.camera.far ) );

    	this.bolt.enableDepth();

    	this.gBuffer = new FBO( { width: this.canvas.width, height: this.canvas.height } );
    	this.gBuffer.bind();
    	this.gBufferRBO = new RBO( { width: this.canvas.width, height: this.canvas.height } );
    	this.gBuffer.unbind();

    	this.normalTexture = new Texture( { width: this.canvas.width, height: this.canvas.height } );
    	this.normalTexture.minFilter = NEAREST;
    	this.normalTexture.magFilter = NEAREST;

    	this.depthTexture = new Texture( { width: this.canvas.width, height: this.canvas.height } );
    	this.uvTexture = new Texture( { width: this.canvas.width, height: this.canvas.height } );

    	this.gBuffer.bind();
    	this.gBuffer.addAttachment( this.normalTexture, COLOR_ATTACHMENT0 + 1 );
    	this.gBuffer.addAttachment( this.depthTexture, COLOR_ATTACHMENT0 + 2 );
    	this.gBuffer.addAttachment( this.uvTexture, COLOR_ATTACHMENT0 + 3 );
    	this.gBuffer.setDrawBuffers();
    	this.gBuffer.unbind();

    	this.post = new Post( this.bolt );

    	this.compShader = new Shader( compositionVertex, compositionFragment );
    	this.compShader.activate();
    	this.compShader.setVector2( "resolution", vec2.fromValues( this.canvas.clientWidth, this.canvas.clientHeight ) );
    	this.compShader.setFloat( "thickness", 0.6 );

    	this.comp = new ShaderPass( this.bolt, {
    		width: this.width,
    		height: this.height,
    		shader: this.compShader
    	} ).setEnabled( true );

    	this.fxaa = new FXAAPass( this.bolt, {
    		width: this.width,
    		height: this.height
    	} ).setEnabled( true );


    	this.post.add( this.comp );
    	this.post.add( this.fxaa, true );

    	this.init();


    }

    async init() {

    	const gltfLoader = new GLTFLoader( this.bolt );
    	this.gltf = await gltfLoader.loadGLTF( "/static/models/gltf/examples/toon/", "Sweep_lookdev_working.gltf" );

    	this.assetsLoaded = true;

    	this.axis = new Axis();
    	this.axis.transform.y = 5;

    	this.floor = new Floor();

    	this.cubeBatch = new Batch( new Mesh( new Cube( { width: 3, height: 3, depth: 3 } ) ), this.bodyShader );
    	this.cubeBatch.transform.y = 0;
    	this.cubeBatch.transform.position = vec3.fromValues( 0, 0, 0 );

    	if ( this.gltf.scenes ) {

    		for ( const scene of this.gltf.scenes ) {

    			if ( scene.name === "penandInk_cubic_forRob" ) {

    				scene.root.traverse( ( node: Node ) => {

    				} );

    			}



    		}

    	}

    	this.resize();

    }

    resize() {

    	this.bolt.resizeFullScreen();
    	this.camera.updateProjection( this.canvas.width / this.canvas.height );
    	this.compShader.activate();
    	this.compShader.setVector2( "resolution", vec2.fromValues( this.gl.canvas.width, this.gl.canvas.height ) );
    	this.post.resize( this.gl.canvas.width, this.gl.canvas.height );
    	this.gBuffer.resize( this.gl.canvas.width, this.gl.canvas.height );
    	this.gBufferRBO.resize( this.gl.canvas.width, this.gl.canvas.height );

    }

    earlyUpdate( elapsed: number, delta: number ) {

    	return;

    }

    drawScene( sceneType = "normal", delta: number ) {

    	this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
    	this.bolt.clear( 0.9, 0.9, 0.9, 1 );

    	if ( this.gltf.scenes ) {

    		for ( const scene of this.gltf.scenes ) {

    			scene.root.transform.position = vec3.fromValues( 1.25, 0, 0 );

    			scene.root.traverse( ( node: Node ) => {

    				if ( node instanceof Batch ) {

    					node.shader = this.geometryShader;

    				}

    			} );

    			this.bolt.draw( scene.root );


    		}

    	}

    	if ( sceneType === "geometry" ) {



    	} else {

    		this.bolt.draw( [ this.floor, this.axis ] );

    	}




    }

    update( elapsed: number, delta: number ) {

    	if ( ! this.assetsLoaded ) return;

    	this.arcball.update();

    	this.bolt.enableDepth();
    	this.bolt.enableCullFace();

    	this.gBuffer.bind();
    	this.drawScene( "geometry", delta );
    	this.gBuffer.unbind();

    	this.post.begin();
    	this.comp.shader.activate();
    	this.comp.shader.setTexture( "normal", this.normalTexture );
    	this.comp.shader.setTexture( "depth", this.depthTexture );
    	this.comp.shader.setTexture( "uv", this.uvTexture );
    	this.drawScene( "normal", delta );
    	this.post.end();

    }

    lateUpdate( elapsed: number, delta: number ) {

    	return;

    }

}
