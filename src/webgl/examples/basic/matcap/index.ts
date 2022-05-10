import Base from "@webgl/Base";
import Bolt, { Shader, Batch, Node, CameraPersp, Texture } from "@bolt-webgl/core";

import matcapVertex from "./shaders/matcap/matcap.vert";
import matcapFragment from "./shaders/matcap/matcap.frag";

import colorVertex from "./shaders/color/color.vert";
import colorFragment from "./shaders/color/color.frag";

import { vec3, vec4, } from "gl-matrix";
import CameraArcball from "@webgl/modules/CameraArcball";
import GLTFLoader from "@/webgl/modules/gltf-Loader";
import { GlTf } from "@/webgl/modules/gltf-Loader/types/GLTF";
export default class extends Base {

    canvas: HTMLCanvasElement;
    shaderEyes: Shader;
    camera: CameraPersp;
    assetsLoaded?: boolean;
    bolt = Bolt.getInstance();
    gl: WebGL2RenderingContext;
    root!: Node;
    gltf!: GlTf;
    arcball: CameraArcball;
    shaderBody: Shader;
    matcapTexture!: Texture;

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
    		position: vec3.fromValues( 0, 6, 6 ),
    		target: vec3.fromValues( 0, 3, 0 ),
    	} );

    	this.arcball = new CameraArcball( this.camera, 4, 0.08 );

    	this.bolt.init( this.canvas, { antialias: true, dpi: 2 } );
    	this.bolt.setCamera( this.camera );

    	this.gl = this.bolt.getContext();

    	this.shaderEyes = new Shader( colorVertex, colorFragment );
    	this.shaderBody = new Shader( matcapVertex, matcapFragment );

    	this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
    	this.bolt.enableDepth();

    	this.init();


    }

    async init() {

    	const gltfLoader = new GLTFLoader( this.bolt );
    	this.gltf = await gltfLoader.loadGLTF( "/static/models/gltf/examples/phantom/", "PhantomLogoPose2.gltf" );

    	this.matcapTexture = new Texture( {
    		imagePath: "/static/textures/matcap/matcap.jpeg"
    	} );

    	await this.matcapTexture.load();

    	this.assetsLoaded = true;

    	this.root = new Node();

    	if ( this.gltf.scenes ) {

    		for ( const scene of this.gltf.scenes ) {

    			scene.root.transform.y = 2;
    			scene.root.setParent( this.root );

    			scene.root.traverse( ( node: Node ) => {

    				if ( node instanceof Batch ) {

    					if ( node.shader.name === "mat_phantom_body" ) {

    						node.shader = this.shaderBody;
    						node.shader.activate();
    						node.shader.setTexture( "baseTexture", this.matcapTexture );
    						node.shader.setVector4( "baseColor", vec4.fromValues( 1, 1, 1, 1 ) );

    					}

    					if ( node.shader.name === "mat_phantom_eyes" ) {

    						node.shader = this.shaderEyes;
    						node.shader.activate();
    						node.shader.setVector4( "baseColor", vec4.fromValues( 0, 0, 0, 1 ) );

    					}

    				}

    			} );

    		}

    	}

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

    	this.arcball.update();

    	this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
    	this.bolt.clear( 0, 0, 0, 0 );

    	this.bolt.draw( this.root );


    }

    lateUpdate( elapsed: number, delta: number ): void {

    	return;

    }

}
