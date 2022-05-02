import Base from "@webgl/Base";
import Bolt, { Shader, Mesh, Transform, Batch, Node, TRIANGLES, LINES } from "@bolt-webgl/core";

import normalVertex from "./shaders/normal/normal.vert";
import normalFragment from "./shaders/normal/normal.frag";

import rayVertex from "./shaders/ray/ray.vert";
import rayFragment from "./shaders/ray/ray.frag";


import { vec3 } from "gl-matrix";
import CameraArcball from "@webgl/modules/CameraArcball";
import Cube from "@webgl/modules/Primitives/Cube";
import Floor from "@/webgl/modules/Batches/Floor";
import AxisAlignedBox from "@/webgl/modules/Raycast/AxisAlignedBox";
import { Bounds } from "@bolt-webgl/core/lib/Mesh";
import Ray from "@/webgl/modules/Raycast/Ray";
import Raycast from "@/webgl/modules/Raycast";

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
    root!: Node;
    floorBatch: any;
    AAbox!: AxisAlignedBox;
    raycast: Raycast;

    constructor() {

    	super();

    	this.width = window.innerWidth;
    	this.height = window.innerHeight;

    	this.canvas = <HTMLCanvasElement>document.getElementById( "experience" );
    	this.canvas.width = this.width;
    	this.canvas.height = this.height;

    	this.bolt = Bolt.getInstance();
    	this.bolt.init( this.canvas, { antialias: true, dpi: 2 } );

    	this.shader = new Shader( normalVertex, normalFragment );

    	this.raycast = new Raycast();

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

    		const ray = this.raycast.generateRayFromCamera( nx, ny, this.camera );

    		this.AAbox.transform( this.cubeBatch.modelMatrix );

    		const intersectsBox = ray.intersectsBox( { min: this.AAbox.min, max: this.AAbox.max } );

    		console.log( intersectsBox );

    		this._debugDrawRay( ray, 20 );


    	} );


    }

    _debugDrawRay( ray: Ray, scale: number ) {

    	// now draw the ray

    	const rayEnd = vec3.clone( ray.origin );
    	const rayScaled = vec3.create();

    	vec3.multiply( rayScaled, ray.direction, vec3.fromValues( scale, scale, scale ) );
    	vec3.add( rayEnd, rayEnd, rayScaled );

    	const debugRay = new Batch(
    		new Mesh( {
    			positions: [
    				ray.origin[ 0 ], ray.origin[ 1 ], ray.origin[ 2 ],
    				rayEnd[ 0 ], rayEnd[ 1 ], rayEnd[ 2 ],
    			]
    		} ).setDrawType( LINES ),
    		new Shader( rayVertex, rayFragment )
    	);

    	debugRay.setParent( this.root );

    }

    async init() {

    	const cubeGeometry = new Cube( { widthSegments: 1, heightSegments: 1 } );

    	this.root = new Node();
    	this.root.name = "root";

    	this.cubeBatch = new Batch(
    		new Mesh( cubeGeometry ).setDrawType( TRIANGLES ),
    		this.shader
    	);

    	this.cubeBatch.mesh.calculateBounds();
    	const bounds: Bounds = this.cubeBatch.mesh.bounds;

    	this.cubeBatch.name = "cube";
    	this.cubeBatch.transform.x = 0.5;
    	this.cubeBatch.transform.y = 0.5;
    	this.cubeBatch.transform.scale = vec3.fromValues( 1, 1, 1 );
    	this.cubeBatch.setParent( this.root );

    	this.AAbox = new AxisAlignedBox( bounds.min, bounds.max );

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
