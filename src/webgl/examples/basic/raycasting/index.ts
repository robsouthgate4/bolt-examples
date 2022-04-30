import Base from "@webgl/Base";
import Bolt, { Shader, Mesh, Transform, Batch, Node, TRIANGLES, LINES } from "@bolt-webgl/core";

import normalVertex from "./shaders/normal/normal.vert";
import normalFragment from "./shaders/normal/normal.frag";

import rayVertex from "./shaders/ray/ray.vert";
import rayFragment from "./shaders/ray/ray.frag";


import { mat4, vec3, vec4, } from "gl-matrix";
import CameraArcball from "@webgl/modules/CameraArcball";
import Cube from "@webgl/modules/Primitives/Cube";
import Floor from "@/webgl/modules/Batches/Floor";

export default class extends Base {

    canvas: HTMLCanvasElement;
    shader: Shader;
    camera: CameraArcball;
    assetsLoaded?: boolean;
    torusTransform!: Transform;
    sphereBatch!: Batch;
    cubeBatch!: Batch;
    planeBatch!: Batch;
    triangleBatch!: Batch;
    bolt: Bolt;
    gl: WebGL2RenderingContext;
    root!: Node;
    floorBatch: any;

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

    	this.shader = new Shader( normalVertex, normalFragment );

    	this.camera = new CameraArcball(
    		this.width,
    		this.height,
    		vec3.fromValues( 0, 3, 5 ),
    		vec3.fromValues( 0, 0, 0 ),
    		45,
    		0.01,
    		1000,
    		0.08,
    		4,
    		0.5
    	);

    	this.bolt.setCamera( this.camera );
    	this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
    	this.bolt.enableDepth();

    	this.init();

    	this.canvas.addEventListener( "click", ( ev ) => {

    		const nx = ( ev.clientX / this.canvas.clientWidth ) * 2 - 1;
    		const ny = 1 - ( ev.clientY / this.canvas.clientHeight ) * 2;

    		const clip = vec4.fromValues( nx, ny, - 1.0, 1.0 );
    		const eye = vec4.fromValues( 0, 0, 0, 0 );

    		const invProjection = mat4.create();

    		mat4.invert( invProjection, this.camera.projection );
    		vec4.transformMat4( eye, clip, invProjection );
    		eye[ 2 ] = - 1;
    		eye[ 3 ] = 0;

    		const world = vec4.fromValues( 0, 0, 0, 0 );
    		const inverseView = mat4.create();

    		mat4.invert( inverseView, this.camera.view );
    		vec4.transformMat4( world, eye, inverseView );

    		const ray = vec3.fromValues( world[ 0 ], world[ 1 ], world[ 2 ] );
    		vec3.normalize( ray, ray );

    		const rayStart = vec3.create();
    		mat4.getTranslation( rayStart, inverseView );

    		const rayEnd = vec3.clone( rayStart );
    		const rayScaled = vec3.create();

    		vec3.multiply( rayScaled, ray, vec3.fromValues( 20, 20, 20 ) );
    		vec3.add( rayEnd, rayEnd, rayScaled );

    		const debugRay = new Batch(
    			new Mesh( {
    				positions: [
    					rayStart[ 0 ], rayStart[ 1 ], rayStart[ 2 ],
    					rayEnd[ 0 ], rayEnd[ 1 ], rayEnd[ 2 ],
    				]
    			} ).setDrawType( LINES ),
    			new Shader( rayVertex, rayFragment )
    		);

    		debugRay.setParent( this.root );

    	} );


    }

    async init() {

    	const cubeGeometry = new Cube( { widthSegments: 1, heightSegments: 1 } );

    	this.root = new Node();
    	this.root.name = "root";

    	this.cubeBatch = new Batch(
    		new Mesh( cubeGeometry ).setDrawType( TRIANGLES ),
    		this.shader
    	);

    	this.cubeBatch.name = "cube";
    	this.cubeBatch.transform.x = 0;
    	this.cubeBatch.transform.y = 0.5;
    	this.cubeBatch.transform.scale = vec3.fromValues( 1, 1, 1 );
    	this.cubeBatch.setParent( this.root );

    	this.floorBatch = new Floor();
    	this.floorBatch.name = "floor";
    	this.floorBatch.setParent( this.root );

    	this.resize();

    }

    resize() {

    	this.bolt.resizeFullScreen();

    }

    earlyUpdate( elapsed: number, delta: number ) {

    	return;

    }

    update( elapsed: number, delta: number ) {

    	this.camera.update();

    	this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
    	this.bolt.clear( 1, 1, 1, 1 );

    	this.bolt.draw( this.root );

    }

    lateUpdate( elapsed: number, delta: number ) {

    	return;

    }

}
