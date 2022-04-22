import Base from "@webgl/Base";
import Bolt, { Shader, Node, Batch, FBO, Texture, COLOR_ATTACHMENT0, RBO, Mesh, NEAREST, TextureCube } from "@bolt-webgl/core";

import FXAAPass from "@/webgl/modules/Post/passes/FXAAPass";
import bodyVertex from "../../examples/shaders/phantom/body/body.vert";
import bodyFragment from "../../examples/shaders/phantom/body/body.frag";
import cubeVertex from "../../examples/shaders/phantom/cube/cube.vert";
import cubeFragment from "../../examples/shaders/phantom/cube/cube.frag";
import eyesVertex from "../../examples/shaders/phantom/eyes/eyes.vert";
import eyesFragment from "../../examples/shaders/phantom/eyes/eyes.frag";
import geometryVertex from "../../examples/shaders/phantom/geometry/geometry.vert";
import geometryFragment from "../../examples/shaders/phantom/geometry/geometry.frag";
import compositionVertex from "../../examples/shaders/phantom/composition/composition.vert";
import compositionFragment from "../../examples/shaders/phantom/composition/composition.frag";

import { vec2, vec3, } from "gl-matrix";
import CameraArcball from "../../modules/CameraArcball";
import GLTFLoader from "@/webgl/modules/GLTFLoader";
import { GlTf } from "@/webgl/modules/GLTFLoader/types/GLTF";
import Post from "@/webgl/modules/Post/Post";
import Axis from "@/webgl/modules/Batches/Axis";
import Floor from "@/webgl/modules/Batches/Floor";
import Cube from "@/webgl/modules/Primitives/Cube";
import ShaderPass from "@/webgl/modules/Post/passes/ShaderPass";

export default class extends Base {

    canvas: HTMLCanvasElement;
    bodyShader: Shader;
    eyesShader: Shader;
    camera: CameraArcball;
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
    cubeShader: Shader;
    cubeTexture!: TextureCube;

    constructor() {

    	super();

    	this.width = window.innerWidth;
    	this.height = window.innerHeight;

    	this.canvas = <HTMLCanvasElement>document.getElementById( "experience" );
    	this.canvas.width = this.width;
    	this.canvas.height = this.height;

    	this.camera = new CameraArcball(
    		this.width,
    		this.height,
    		vec3.fromValues( 0, 0, 10 ),
    		vec3.fromValues( 0, 2.8, 0 ),
    		45,
    		0.1,
    		100
    	);

    	this.bolt = Bolt.getInstance();
    	this.bolt.init( this.canvas, { antialias: true, dpi: 2 } );
    	this.bolt.setCamera( this.camera );

    	this.gl = this.bolt.getContext();

    	this.bodyShader = new Shader( bodyVertex, bodyFragment );
    	this.eyesShader = new Shader( eyesVertex, eyesFragment );

    	this.geometryShader = new Shader( geometryVertex, geometryFragment );
    	this.geometryShader.activate();
    	this.geometryShader.setVector2( "cameraPlanes", vec2.fromValues( this.camera.near, this.camera.far ) );

    	this.cubeShader = new Shader( cubeVertex, cubeFragment );

    	this.bolt.enableDepth();

    	this.gBuffer = new FBO( { width: this.canvas.width, height: this.canvas.height } );
    	this.gBuffer.bind();
    	this.gBufferRBO = new RBO( { width: this.canvas.width, height: this.canvas.height } );
    	this.gBuffer.unbind();

    	this.normalTexture = new Texture( { width: this.canvas.width, height: this.canvas.height } );
    	this.normalTexture.minFilter = NEAREST;
    	this.normalTexture.magFilter = NEAREST;

    	this.gBuffer.bind();
    	this.gBuffer.addAttachment( this.normalTexture, COLOR_ATTACHMENT0 + 1 );
    	this.gBuffer.setDrawBuffers();
    	this.gBuffer.unbind();

    	this.post = new Post( this.bolt );

    	this.compShader = new Shader( compositionVertex, compositionFragment );
    	this.compShader.activate();
    	this.compShader.setVector2( "resolution", vec2.fromValues( this.canvas.width, this.canvas.height ) );
    	this.compShader.setFloat( "thickness", 0.5 );

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
    	this.gltf = await gltfLoader.loadGLTF( "/static/models/gltf/", "PhantomLogoPose.gltf" );

    	this.assetsLoaded = true;

    	this.axis = new Axis();
    	this.axis.transform.y = 0.01;

    	this.floor = new Floor();

    	this.cubeBatch = new Batch( new Mesh( new Cube( { width: 3, height: 3, depth: 3 } ) ), this.bodyShader );
    	this.cubeBatch.transform.y = 0;
    	this.cubeBatch.transform.position = vec3.fromValues( 0, 0, 0 );



    	if ( this.gltf.scenes ) {

    		for ( const scene of this.gltf.scenes ) {

    			scene.root.traverse( ( node: Node ) => {

    				if ( node.name === "phantom_logoPose" ) {

    					node.transform.y = 2.8;

    				}

    			} );

    		}

    	}

    	this.resize();

    }

    resize() {

    	this.bolt.resizeFullScreen();
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

    			scene.root.traverse( ( node: Node ) => {

    				if ( node.name === "phantom_logoPose" ) {

    					if ( sceneType === "geometry" ) {

    						node.children.forEach( ( batch: Node ) => {

    							if ( sceneType === "geometry" ) {

    								const b = <Batch>batch;
    								b.shader = this.geometryShader;

    							}

    						} );

    					} else {

    						const batch1 = <Batch>node.children[ 0 ];
    						batch1.shader = this.bodyShader;

    						const batch2 = <Batch>node.children[ 1 ];
    						batch2.shader = this.eyesShader;

    					}

    				}

    				this.bolt.draw( node );

    			} );

    		}

    	}

    	if ( sceneType === "geometry" ) {

    		this.cubeBatch.shader = this.geometryShader;

    	} else {

    		this.cubeBatch.shader = this.cubeShader;

    	}

    	this.bolt.draw( this.cubeBatch );


    }

    update( elapsed: number, delta: number ) {

    	if ( ! this.assetsLoaded ) return;

    	this.camera.update();

    	this.bolt.enableDepth();
    	this.bolt.enableCullFace();

    	this.gBuffer.bind();
    	this.drawScene( "geometry", delta );
    	this.gBuffer.unbind();

    	this.post.begin();
    	this.comp.shader.activate();
    	this.comp.shader.setTexture( "normal", this.normalTexture );
    	this.drawScene( "normal", delta );
    	this.post.end();

    }

    lateUpdate( elapsed: number, delta: number ) {

    	return;

    }

}
