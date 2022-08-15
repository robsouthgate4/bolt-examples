import Base from "@webgl/Base";
import Bolt, { Shader, Mesh, Transform, Batch, Node, TRIANGLES, LINES, CameraPersp } from "@bolt-webgl/core";

import normalVertex from "./shaders/normal/normal.vert";
import normalFragment from "./shaders/normal/normal.frag";

import rayVertex from "./shaders/ray/ray.vert";
import rayFragment from "./shaders/ray/ray.frag";


import { vec3 } from "gl-matrix";
import CameraArcball from "@webgl/modules/CameraArcball";
import Floor from "@/webgl/modules/batches/floor";
import AxisAlignedBox from "@/webgl/modules/raycast/AxisAlignedBox";
import { BoxBounds } from "@bolt-webgl/core/build/Mesh";
import Ray from "@/webgl/modules/raycast/Ray";
import Raycast from "@/webgl/modules/raycast";
import Sphere from "@/webgl/modules/primitives/Sphere";
import Cube from "@/webgl/modules/primitives/Cube";

export default class extends Base {

    canvas: HTMLCanvasElement;
    shader: Shader;
    camera: CameraPersp;
    assetsLoaded?: boolean;
    torusTransform!: Transform;
    sphereBatch!: Batch;
    planeBatch!: Batch;
    triangleBatch!: Batch;
    bolt: Bolt;
    root!: Node;
    floorBatch: any;
    AAbox!: AxisAlignedBox;
    AABoxHelper!: Batch;
    raycast: Raycast;
    intersectionDebugBatch!: Batch;
    arcball: CameraArcball;

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

    	this.camera = new CameraPersp( {
    		aspect: this.canvas.width / this.canvas.height,
    		fov: 45,
    		near: 0.1,
    		far: 1000,
    		position: vec3.fromValues( 0, 3, 10 ),
    		target: vec3.fromValues( 0, 1, 0 ),
    	} );

    	this.arcball = new CameraArcball( this.camera, 4, 0.08 );

    	this.bolt.setCamera( this.camera );
    	this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
    	this.bolt.enableDepth();

    	this.init();

    	this.canvas.addEventListener( "click", ( ev ) => {

    		const nx = ( ev.clientX / this.canvas.clientWidth ) * 2 - 1;
    		const ny = 1 - ( ev.clientY / this.canvas.clientHeight ) * 2;

    		const ray = this.raycast.generateRayFromCamera( nx, ny, this.camera );

    		this.AAbox.transform( this.sphereBatch.modelMatrix );

    		const intersectsBox = ray.intersectsBox( { min: this.AAbox.min, max: this.AAbox.max } );

    		let hit = vec3.fromValues( - 900, - 900, - 900 );

    		if ( intersectsBox ) {

    			// now run the triangle intersection test

    			for ( let i = 0; i < this.sphereBatch.mesh.faces.length; i ++ ) {

    				const tri = this.sphereBatch.mesh.faces[ i ].vertices.map( ( vertex ) => {

    					// transform the face by the sphere world matrix

    					const vecTransformed = vec3.fromValues( vertex[ 0 ], vertex[ 1 ], vertex[ 2 ] );
    					vec3.transformMat4( vecTransformed, vecTransformed, this.sphereBatch.modelMatrix );

    					return vec3.fromValues( vecTransformed[ 0 ], vecTransformed[ 1 ], vecTransformed[ 2 ] );

    				} );

    				ray.intersectTriangle( hit, tri );

    				if ( vec3.length( hit ) !== 0 ) {

    					break;

    				}

    			}

    		}

    		this.intersectionDebugBatch.transform.position = hit;

    		this._debugDrawRay( ray, 20 );


    	} );


    }

    _debugDrawRay( ray: Ray, scale: number ) {

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

    	const sphereGeometry = new Sphere( { radius: 1 } );

    	this.root = new Node();
    	this.root.name = "root";

    	this.sphereBatch = new Batch(
    		new Mesh( sphereGeometry ).setDrawType( TRIANGLES ),
    		this.shader
    	);

    	this.sphereBatch.mesh.calculateBoxBounds();
    	const bounds: BoxBounds = this.sphereBatch.mesh.bounds;

    	this.sphereBatch.name = "cube";
    	this.sphereBatch.transform.positionY = 1;
    	this.sphereBatch.transform.scale = vec3.fromValues( 1, 1, 1 );
    	this.sphereBatch.updateModelMatrix();
    	this.sphereBatch.setParent( this.root );

    	this.intersectionDebugBatch = new Batch( new Mesh( new Cube() ), this.shader );
    	this.intersectionDebugBatch.transform.scale = vec3.fromValues( 0.2, 0.2, 0.2 );
    	this.intersectionDebugBatch.transform.positionY = - 999;

    	this.intersectionDebugBatch.setParent( this.root );

    	this.AAbox = new AxisAlignedBox( bounds.min, bounds.max );
    	this.AAbox.createVisualiser();
    	this.AAbox.transform( this.sphereBatch.modelMatrix );
    	this.AAbox.visualiser?.setParent( this.root );

    	this.floorBatch = new Floor();
    	this.floorBatch.name = "floor";
    	this.floorBatch.setParent( this.root );

    	this.resize();

    }

    resize() {

    	this.bolt.resizeFullScreen();
    	this.camera.updateProjection( this.canvas.width / this.canvas.height );

    }

    earlyUpdate( elapsed: number, delta: number ) {

    	return;

    }

    update( elapsed: number, delta: number ) {

    	this.arcball.update();

    	this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
    	this.bolt.clear( 1, 1, 1, 1 );

    	this.bolt.draw( this.root );

    }

    lateUpdate( elapsed: number, delta: number ) {

    	return;

    }

}
