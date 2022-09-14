import Base from "@webgl/Base";
import Bolt, { Program, Mesh, Transform, DrawSet, Node, TRIANGLES, LINES, CameraPersp } from "@bolt-webgl/core";

import normalVertex from "./shaders/normal/normal.vert";
import normalFragment from "./shaders/normal/normal.frag";

import rayVertex from "./shaders/ray/ray.vert";
import rayFragment from "./shaders/ray/ray.frag";


import { vec3 } from "gl-matrix";
import Orbit from "@webgl/modules/orbit";
import Floor from "@/webgl/modules/draw-sets/floor";
import AxisAlignedBox from "@/webgl/modules/raycast/AxisAlignedBox";
import { BoxBounds } from "@bolt-webgl/core/build/Mesh";
import Ray from "@/webgl/modules/raycast/Ray";
import Raycast from "@/webgl/modules/raycast";
import Sphere from "@/webgl/modules/primitives/Sphere";
import Cube from "@/webgl/modules/primitives/Cube";

export default class extends Base {

	canvas: HTMLCanvasElement;
	program: Program;
	camera: CameraPersp;
	assetsLoaded?: boolean;
	torusTransform!: Transform;
	sphereDrawSet!: DrawSet;
	planeDrawSet!: DrawSet;
	triangleDrawSet!: DrawSet;
	bolt: Bolt;
	root!: Node;
	floorDrawSet: any;
	AAbox!: AxisAlignedBox;
	AABoxHelper!: DrawSet;
	raycast: Raycast;
	intersectionDebugDrawSet!: DrawSet;
	orbit: Orbit;

	constructor() {

		super();

		this.width = window.innerWidth;
		this.height = window.innerHeight;

		this.canvas = <HTMLCanvasElement>document.getElementById( "experience" );
		this.canvas.width = this.width;
		this.canvas.height = this.height;

		this.bolt = Bolt.getInstance();
		this.bolt.init( this.canvas, { antialias: true, dpi: 2 } );

		this.program = new Program( normalVertex, normalFragment );

		this.raycast = new Raycast();

		this.camera = new CameraPersp( {
			aspect: this.canvas.width / this.canvas.height,
			fov: 45,
			near: 0.1,
			far: 1000,
			position: vec3.fromValues( 0, 3, 10 ),
			target: vec3.fromValues( 0, 1, 0 ),
		} );

		this.orbit = new Orbit( this.camera );

		this.bolt.setCamera( this.camera );
		this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
		this.bolt.enableDepth();

		this.init();

		this.canvas.addEventListener( "click", ( ev ) => {

			const nx = ( ev.clientX / this.canvas.clientWidth ) * 2 - 1;
			const ny = 1 - ( ev.clientY / this.canvas.clientHeight ) * 2;

			const ray = this.raycast.generateRayFromCamera( nx, ny, this.camera );

			this.AAbox.transform( this.sphereDrawSet.modelMatrix );

			const intersectsBox = ray.intersectsBox( { min: this.AAbox.min, max: this.AAbox.max } );

			let hit = vec3.fromValues( - 900, - 900, - 900 );

			if ( intersectsBox ) {

				// now run the triangle intersection test

				for ( let i = 0; i < this.sphereDrawSet.mesh.faces.length; i ++ ) {

					const tri = this.sphereDrawSet.mesh.faces[ i ].vertices.map( ( vertex ) => {

						// transform the face by the sphere world matrix

						const vecTransformed = vec3.fromValues( vertex[ 0 ], vertex[ 1 ], vertex[ 2 ] );
						vec3.transformMat4( vecTransformed, vecTransformed, this.sphereDrawSet.modelMatrix );

						return vec3.fromValues( vecTransformed[ 0 ], vecTransformed[ 1 ], vecTransformed[ 2 ] );

					} );

					ray.intersectTriangle( hit, tri );

					if ( vec3.length( hit ) !== 0 ) {

						break;

					}

				}

			}

			this.intersectionDebugDrawSet.transform.position = hit;

			this._debugDrawRay( ray, 20 );


		} );


	}

	_debugDrawRay( ray: Ray, scale: number ) {

		const rayEnd = vec3.clone( ray.origin );
		const rayScaled = vec3.create();

		vec3.multiply( rayScaled, ray.direction, vec3.fromValues( scale, scale, scale ) );
		vec3.add( rayEnd, rayEnd, rayScaled );

		const debugRay = new DrawSet(
			new Mesh( {
				positions: [
					ray.origin[ 0 ], ray.origin[ 1 ], ray.origin[ 2 ],
					rayEnd[ 0 ], rayEnd[ 1 ], rayEnd[ 2 ],
				]
			} ).setDrawType( LINES ),
			new Program( rayVertex, rayFragment )
		);

		debugRay.setParent( this.root );

	}

	async init() {

		const sphereGeometry = new Sphere( { radius: 1 } );

		this.root = new Node();
		this.root.name = "root";

		this.sphereDrawSet = new DrawSet(
			new Mesh( sphereGeometry ).setDrawType( TRIANGLES ),
			this.program
		);

		this.sphereDrawSet.mesh.calculateBoxBounds();
		const bounds: BoxBounds = this.sphereDrawSet.mesh.bounds;

		this.sphereDrawSet.name = "cube";
		this.sphereDrawSet.transform.positionY = 1;
		this.sphereDrawSet.transform.scale = vec3.fromValues( 1, 1, 1 );
		this.sphereDrawSet.updateModelMatrix();
		this.sphereDrawSet.setParent( this.root );

		this.intersectionDebugDrawSet = new DrawSet( new Mesh( new Cube() ), this.program );
		this.intersectionDebugDrawSet.transform.scale = vec3.fromValues( 0.2, 0.2, 0.2 );
		this.intersectionDebugDrawSet.transform.positionY = - 999;

		this.intersectionDebugDrawSet.setParent( this.root );

		this.AAbox = new AxisAlignedBox( bounds.min, bounds.max );
		this.AAbox.createVisualiser();
		this.AAbox.transform( this.sphereDrawSet.modelMatrix );
		this.AAbox.visualiser?.setParent( this.root );

		this.floorDrawSet = new Floor();
		this.floorDrawSet.name = "floor";
		this.floorDrawSet.setParent( this.root );

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

		this.orbit.update();

		this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
		this.bolt.clear( 1, 1, 1, 1 );

		this.bolt.draw( this.root );

	}

	lateUpdate( elapsed: number, delta: number ) {

		return;

	}

}
