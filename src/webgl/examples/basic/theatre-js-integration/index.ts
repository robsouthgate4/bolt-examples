
import Base from "@webgl/Base";
import Bolt, { Program, Texture2D, DrawSet, Node, CameraPersp } from "@bolt-webgl/core";
import state from "./state.json";

import { vec3, vec4, } from "gl-matrix";
import CameraArcball from "@webgl/modules/CameraArcball";

import matcapVertex from "../matcap/shaders/matcap/matcap.vert";
import matcapFragment from "../matcap/shaders/matcap/matcap.frag";

import colorVertex from "../matcap/shaders/color/color.vert";
import colorFragment from "../matcap/shaders/color/color.frag";

import { getProject, ISheetObject, types as t } from "@theatre/core";
import studio from "@theatre/studio";
import GLTFLoader from "@/webgl/modules/gltf-loader";
import Floor from "@/webgl/modules/draw-sets/floor";

export default class extends Base {

	canvas: HTMLCanvasElement;
	root!: Node;

	camera: CameraPersp;
	assetsLoaded?: boolean;
	bolt: Bolt;
	gl: WebGL2RenderingContext;
	arcball: CameraArcball;

	dudeMotionConfig = {
		x: t.number( 0, {
			nudgeMultiplier: 0.25,
		} ),
		y: t.number( 0, {
			nudgeMultiplier: 0.25,
		} ),
		z: t.number( 0, {
			nudgeMultiplier: 0.25,
		} ),
		scaleX: t.number( 1, {
			nudgeMultiplier: 0.25,
		} ),
		scaleY: t.number( 1, {
			nudgeMultiplier: 0.25,
		} ),
		scaleZ: t.number( 1, {
			nudgeMultiplier: 0.25,
		} ),
	};

	theatreProject!: ISheetObject<typeof this.dudeMotionConfig>;
	programBody: any;
	programEyes: any;
	gltf!: Node;
	matcapTexture!: Texture2D;
	floor!: Floor;

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
			position: vec3.fromValues( 4, 2, 4 ),
			target: vec3.fromValues( 0, 2.5, 0 ),
		} );

		this.programEyes = new Program( colorVertex, colorFragment );
		this.programBody = new Program( matcapVertex, matcapFragment );

		this.arcball = new CameraArcball( this.camera, 4, 0.08 );

		this.bolt.setCamera( this.camera );
		this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
		this.bolt.enableDepth();

		this.setupTheatre();
		this.init();



	}

	setupTheatre() {

		const project = getProject( "Example with TheatreJS", { state } );

		const sequence = project.sheet( "Sheet" ).sequence;

		// create a project, sheet, and object
		this.theatreProject = project
			.sheet( "Sheet" )
			.object( "Dude", this.dudeMotionConfig );

		// initialize the studio so the editing tools will appear on the screen
		studio.initialize();

		project.ready.then( () => {

			sequence.play( {
				iterationCount: Infinity
			} );

		} );

	}

	async init() {

		const gltfLoader = new GLTFLoader( this.bolt );
		this.gltf = await gltfLoader.load( "/static/models/gltf/examples/phantom/PhantomLogoPose2.gltf" );

		this.matcapTexture = new Texture2D( {
			imagePath: "/static/textures/matcap/matcap3.jpeg"
		} );

		await this.matcapTexture.load();

		this.assetsLoaded = true;

		this.root = new Node();

		this.floor = new Floor();

		this.gltf.transform.scale = vec3.fromValues( 0.5, 0.5, 0.5 );
		this.gltf.setParent( this.root );

		this.gltf.traverse( ( node: Node ) => {

			if ( node instanceof DrawSet ) {

				if ( node.program.name === "mat_phantom_body" ) {

					node.program = this.programBody;
					node.program.activate();
					node.program.setTexture( "baseTexture", this.matcapTexture );
					node.program.setVector4( "baseColor", vec4.fromValues( 1, 1, 1, 1 ) );

				}

				if ( node.program.name === "mat_phantom_eyes" ) {

					node.program = this.programEyes;
					node.program.activate();
					node.program.setVector4( "baseColor", vec4.fromValues( 0, 0, 0, 1 ) );

				}

			}

		} );

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

		if ( ! this.assetsLoaded ) return;

		this.arcball.update();

		this.bolt.setViewPort( 0, 0, this.canvas.width, this.canvas.height );
		this.bolt.clear( 0.6, 0.6, 0.6, 1 );

		this.root.transform.position = vec3.fromValues(
			this.theatreProject.value.x,
			this.theatreProject.value.y,
			this.theatreProject.value.z
		);

		this.root.transform.scale = vec3.fromValues(
			this.theatreProject.value.scaleX,
			this.theatreProject.value.scaleY,
			this.theatreProject.value.scaleZ
		);


		this.bolt.draw( this.root );
		this.bolt.draw( this.floor );


	}

	lateUpdate( elapsed: number, delta: number ) {

		return;

	}

}
