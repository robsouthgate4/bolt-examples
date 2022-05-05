

import Base from "@webgl/Base";
import Bolt, { Shader, Transform, Mesh, Node, Batch } from "@bolt-webgl/core";

import defaultVertexInstanced from "./shaders/defaultInstanced/defaultInstanced.vert";
import defaultFragmentInstanced from "./shaders/defaultInstanced/defaultInstanced.frag";

import { mat4, quat, vec3, } from "gl-matrix";
import CameraFPS from "@/webgl/modules/CameraFPS";
import GLTFLoader from "@/webgl/modules/GLTFLoader";

export default class extends Base {

    canvas: HTMLCanvasElement;
    colorShader: Shader;
    lightPosition: vec3;
    camera: CameraFPS;
    assetsLoaded!: boolean;
    cubeTransform!: Transform;
    torusBuffer!: Mesh;
    toruseGLTFBuffer!: Mesh;
    bolt: Bolt;

    constructor() {

    	super();

    	const devicePixelRatio = Math.min( 2, window.devicePixelRatio || 1 );

    	this.width = window.innerWidth * devicePixelRatio;
    	this.height = window.innerHeight * devicePixelRatio;

    	this.canvas = <HTMLCanvasElement>document.getElementById( "experience" );
    	this.canvas.width = this.width;
    	this.canvas.height = this.height;

    	this.camera = new CameraFPS(
    		this.width,
    		this.height,
    		vec3.fromValues( 0, 5, - 5 ),
    		45,
    		0.1,
    		500,
    	);

    	this.bolt = Bolt.getInstance();
    	this.bolt.init( this.canvas, { antialias: true } );
    	this.bolt.setCamera( this.camera );

    	this.colorShader = new Shader( defaultVertexInstanced, defaultFragmentInstanced );

    	this.lightPosition = vec3.fromValues( 0, 10, 0 );

    	this.camera.lookAt( vec3.fromValues( 0, 0, - 50 ) );

    	this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
    	this.bolt.enableDepth();

    	this.init();


    }

    async init() {

    	const instanceCount = 1000;

    	const instanceMatrices: mat4[] = [];

    	for ( let i = 0; i < instanceCount; i ++ ) {

    		const x = ( Math.random() * 2 - 1 ) * 50;
    		const y = ( Math.random() * 2 - 1 ) * 20;
    		const z = Math.random() * 200;

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

    	this.torusBuffer.drawTriangles( shader );

    }

    update( elapsed: number, delta: number ) {

    	if ( ! this.assetsLoaded ) return;


    	this.camera.update( delta );

    	this.drawInstances( this.colorShader, elapsed );



    }

    lateUpdate( elapsed: number, delta: number ) {

    	return;

    }

}
