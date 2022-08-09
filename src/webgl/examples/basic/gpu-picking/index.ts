
import Base from "@webgl/Base";
import Bolt, { Shader, Texture, Batch, Node, CameraPersp, Mesh } from "@bolt-webgl/core";

import { vec2, vec3, vec4 } from "gl-matrix";
import CameraArcball from "@webgl/modules/CameraArcball";

import diffuseVertex from "./shaders/diffuse/diffuse.vert";
import diffuseFragment from "./shaders/diffuse/diffuse.frag";
import { GlTf } from "@/webgl/modules/gltf-loader/types/GLTF";
import Floor from "@/webgl/modules/batches/floor";
import Sphere from "@/webgl/modules/primitives/Sphere";
import GPUPicker from "@/webgl/modules/gpu-picker";

interface PickingData {
	batch: Batch,
	id: number
}

export default class extends Base {

	canvas: HTMLCanvasElement;
	root!: Node;

	camera: CameraPersp;
	assetsLoaded?: boolean;
	bolt: Bolt;
	gl: WebGL2RenderingContext;
	arcball!: CameraArcball;

	shader: any;
	shaderEyes: any;
	gltf!: GlTf;
	matcapTexture!: Texture;
	floor!: Floor;

	objectCount: number = 10;
	picker!: GPUPicker;
	currentPickerID: number = - 1;
	pickingDataArray: PickingData[] = [];
	mouse: vec2 = vec2.fromValues( - 1, - 1 );

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

		// initialise the gpu picker
		this.picker = new GPUPicker( this.bolt );

		this.init();
		this.addListeners();


	}

	addListeners() {

		this.canvas.addEventListener( 'mousemove', ( e: MouseEvent ) => {

			const rect = this.canvas.getBoundingClientRect();
			this.mouse[ 0 ] = e.clientX - rect.left;
			this.mouse[ 1 ] = e.clientY - rect.top;

			// Get the id of the object beneath the mouse
			const pickingId = this.picker.pick( this.mouse );

			if ( this.currentPickerID != pickingId ) {

				this.currentPickerID = pickingId;

				for ( let i = 0; i < this.pickingDataArray.length; i ++ ) {

					const pickingItem = this.pickingDataArray[ i ];
					const { batch } = pickingItem;

					if ( pickingItem.id === this.currentPickerID ) {

						batch.transform.scale = vec3.fromValues( 1.1, 1.1, 1.1 );
						batch.shader.activate();
						batch.shader.setVector4( "baseColor", vec4.fromValues( 0.9, 0.9, 1, 1 ) );

					} else {

						batch.transform.scale = vec3.fromValues( 1, 1, 1 );
						batch.shader.activate();
						batch.shader.setVector4( "baseColor", vec4.fromValues( 1, 1, 1, 1 ) );

					}

				}

			}

		} );

	}

	async init() {

		this.root = new Node();
		this.floor = new Floor();

		const xCount = this.objectCount;
		const yCount = this.objectCount;

		const gridPadding = 2.25;
		let id = 0;

		for ( let x = 0; x < xCount; x ++ ) {

			for ( let y = 0; y < yCount; y ++ ) {

				id ++;

				const shader = new Shader( diffuseVertex, diffuseFragment );
				shader.activate();
				shader.setVector4( "baseColor", vec4.fromValues( 1, 1, 1, 1 ) );

				const sphereBatch = new Batch(
					new Mesh( new Sphere( { widthSegments: 8, heightSegments: 8 } ) ),
					shader
				);

				// generate ids to match picker against
				this.pickingDataArray.push( {
					batch: sphereBatch,
					id
				} );

				sphereBatch.transform.positionX = ( x - ( xCount * 0.45 ) ) * gridPadding;
				sphereBatch.transform.positionY = y * gridPadding + 0.75;
				sphereBatch.setParent( this.root );

			}

		}

		// pass the nodes that need to be picked
		this.picker.setNodes( this.root );

		this.resize();

	}

	resize() {

		this.bolt.resizeFullScreen();
		this.picker.resize();
		this.camera.updateProjection( this.canvas.width / this.canvas.height );

	}

	earlyUpdate( elapsed: number, delta: number ) {

		return;

	}

	update( elapsed: number, delta: number ) {

		this.arcball.update();



		this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
		this.bolt.clear( 0.8, 0.8, 0.8, 1 );
		this.bolt.draw( this.root );
		this.bolt.draw( this.floor );

	}

	lateUpdate( elapsed: number, delta: number ) {

		return;

	}

}
