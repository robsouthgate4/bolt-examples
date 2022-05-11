
import Base from "@webgl/Base";
import Bolt, { Shader, Texture, Batch, Node, CameraPersp, Mesh } from "@bolt-webgl/core";

import { vec3, vec4 } from "gl-matrix";
import CameraArcball from "@webgl/modules/CameraArcball";

import diffuseVertex from "./shaders/diffuse/diffuse.vert";
import diffuseFragment from "./shaders/diffuse/diffuse.frag";
import GLTFLoader from "@/webgl/modules/gltf-loader";
import { GlTf } from "@/webgl/modules/gltf-loader/types/GLTF";
import Floor from "@/webgl/modules/batches/floor";
import Sphere from "@/webgl/modules/primitives/Sphere";
import GPUPicker from "@/webgl/modules/gpu-picker";

export default class extends Base {

    canvas: HTMLCanvasElement;
    root!: Node;

    camera: CameraPersp;
    assetsLoaded?: boolean;
    bolt: Bolt;
    gl: WebGL2RenderingContext;
    arcball: CameraArcball;

    shader: any;
    shaderEyes: any;
    gltf!: GlTf;
    matcapTexture!: Texture;
    floor!: Floor;

    objectCount: number = 20;
    picker: GPUPicker;

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

    	this.picker = new GPUPicker( { width: this.canvas.width, height: this.canvas.height } );

    	this.camera = new CameraPersp( {
    		aspect: this.canvas.width / this.canvas.height,
    		fov: 45,
    		near: 0.1,
    		far: 1000,
    		position: vec3.fromValues( 0, 10, 40 ),
    		target: vec3.fromValues( 0, 10, 0 ),
    	} );

    	this.shader = new Shader( diffuseVertex, diffuseFragment );

    	this.arcball = new CameraArcball( this.camera, 4, 0.08 );

    	this.bolt.setCamera( this.camera );
    	this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
    	this.bolt.enableDepth();

    	this.init();

    }

    async init() {

    	this.assetsLoaded = true;

    	this.shader.activate();
    	this.shader.setVector4( "baseColor", vec4.fromValues( 1, 1, 1, 1 ) );

    	this.root = new Node();
    	this.floor = new Floor();

    	const xCount = this.objectCount / 2;
    	const yCount = this.objectCount / 2;

    	const gridPadding = 2.25;
    	let id = 0;

        interface PickingData {
            batch: Batch | undefined,
            id: number | null
        }

        const pickingDataArray: PickingData[] = [];

    	for ( let x = 0; x < xCount; x ++ ) {

    		for ( let y = 0; y < yCount; y ++ ) {

        		id ++;

    			const sphereBatch = new Batch(
    				new Mesh( new Sphere( { widthSegments: 24, heightSegments: 24 } ) ),
    				this.shader
    			);

        		pickingDataArray.push( {
        			batch: sphereBatch,
        			id
        		} );

    			sphereBatch.transform.x = ( x - ( xCount * 0.45 ) ) * gridPadding;
    			sphereBatch.transform.y = y * gridPadding + 0.75;
    			sphereBatch.setParent( this.root );

    		}

    	}

        console.log( pickingDataArray );

    	this.resize();

    }

    resize() {

    	this.bolt.resizeFullScreen();
    	this.picker.resize( this.canvas.width, this.canvas.height );
    	this.camera.updateProjection( this.canvas.width / this.canvas.height );

    }

    earlyUpdate( elapsed: number, delta: number ) {

    	return;

    }

    update( elapsed: number, delta: number ) {

    	if ( ! this.assetsLoaded ) return;

    	this.arcball.update();

    	this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
    	this.bolt.clear( 0.6, 0.6, 0.6, 1 );


    	this.bolt.draw( [ this.root, this.floor ] );

    }

    lateUpdate( elapsed: number, delta: number ) {

    	return;

    }

}
