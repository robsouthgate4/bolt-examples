import Base from "@webgl/Base";
import Shader from "../core/Shader";
import Texture from "../core/Texture";

import volumetricVertex from "../core/shaders/volumetric/volumetric.vert";
import volumetricFragment from "../core/shaders/volumetric/volumetric.frag";

import { glMatrix, vec3, } from "gl-matrix";
import ArrayBuffer from "../core/ArrayBuffer";
import { loadBinaryBuffer } from "../../utils";
import Node from "../modules/SceneGraph/Node";
import Transform from "../modules/SceneGraph/Transform";
import CameraArcball from "../modules/CameraArcball";

const vertices = [
	- 0.5, - 0.5, - 0.5, 0.0, 0.0, - 1.0,
	0.5, - 0.5, - 0.5, 0.0, 0.0, - 1.0,
	0.5, 0.5, - 0.5, 0.0, 0.0, - 1.0,
	0.5, 0.5, - 0.5, 0.0, 0.0, - 1.0,
	- 0.5, 0.5, - 0.5, 0.0, 0.0, - 1.0,
	- 0.5, - 0.5, - 0.5, 0.0, 0.0, - 1.0,

	- 0.5, - 0.5, 0.5, 0.0, 0.0, 1.0,
	0.5, - 0.5, 0.5, 0.0, 0.0, 1.0,
	0.5, 0.5, 0.5, 0.0, 0.0, 1.0,
	0.5, 0.5, 0.5, 0.0, 0.0, 1.0,
	- 0.5, 0.5, 0.5, 0.0, 0.0, 1.0,
	- 0.5, - 0.5, 0.5, 0.0, 0.0, 1.0,

	- 0.5, 0.5, 0.5, - 1.0, 0.0, 0.0,
	- 0.5, 0.5, - 0.5, - 1.0, 0.0, 0.0,
	- 0.5, - 0.5, - 0.5, - 1.0, 0.0, 0.0,
	- 0.5, - 0.5, - 0.5, - 1.0, 0.0, 0.0,
	- 0.5, - 0.5, 0.5, - 1.0, 0.0, 0.0,
	- 0.5, 0.5, 0.5, - 1.0, 0.0, 0.0,

	0.5, 0.5, 0.5, 1.0, 0.0, 0.0,
	0.5, 0.5, - 0.5, 1.0, 0.0, 0.0,
	0.5, - 0.5, - 0.5, 1.0, 0.0, 0.0,
	0.5, - 0.5, - 0.5, 1.0, 0.0, 0.0,
	0.5, - 0.5, 0.5, 1.0, 0.0, 0.0,
	0.5, 0.5, 0.5, 1.0, 0.0, 0.0,

	- 0.5, - 0.5, - 0.5, 0.0, - 1.0, 0.0,
	0.5, - 0.5, - 0.5, 0.0, - 1.0, 0.0,
	0.5, - 0.5, 0.5, 0.0, - 1.0, 0.0,
	0.5, - 0.5, 0.5, 0.0, - 1.0, 0.0,
	- 0.5, - 0.5, 0.5, 0.0, - 1.0, 0.0,
	- 0.5, - 0.5, - 0.5, 0.0, - 1.0, 0.0,

	- 0.5, 0.5, - 0.5, 0.0, 1.0, 0.0,
	0.5, 0.5, - 0.5, 0.0, 1.0, 0.0,
	0.5, 0.5, 0.5, 0.0, 1.0, 0.0,
	0.5, 0.5, 0.5, 0.0, 1.0, 0.0,
	- 0.5, 0.5, 0.5, 0.0, 1.0, 0.0,
	- 0.5, 0.5, - 0.5, 0.0, 1.0, 0.0
];

export default class World extends Base {

	constructor() {

		super();

		this.width = 512;
		this.height = 512;

		this.canvas = document.getElementById( "experience" );
		this.canvas.width = this.width;
		this.canvas.height = this.height;
		this.gl = this.canvas.getContext( "webgl2", { antialias: true } );

		this.lightingShader = new Shader( { vertexShader: volumetricVertex, fragmentShader: volumetricFragment, gl: this.gl } );
		this.lightPosition = vec3.fromValues( 0, 10, 0 );

		this.camera = new CameraArcball( {
			width: this.width,
			height: this.height,
			gl: this.gl,
			position: vec3.fromValues( 0, 0, 0 ),
			near: 0.01,
			far: 1000,
			fov: 45
		} );

		this.gl.viewport( 0, 0, this.gl.canvas.width, this.gl.canvas.height );
		this.gl.enable( this.gl.DEPTH_TEST );

		this.init();


	}

	async loadGLTF( url ) {

		const gltf = await ( await fetch( url ) ).json();

		const bin = await loadBinaryBuffer( `/static/models/gltf/${gltf.buffers[ 0 ].uri}` );

		const positionAccessorId = gltf.meshes[ 0 ].primitives[ 0 ].attributes.POSITION;

		if ( gltf.accessors[ positionAccessorId ].componentType != 5126 ) {

			return 0;

		}

		const positionBufferViewID = gltf.accessors[ positionAccessorId ].bufferView;

		const positions = new Float32Array(
			bin,
			gltf.bufferViews[ positionBufferViewID ].byteOffset,
			gltf.bufferViews[ positionBufferViewID ].byteLength / Float32Array.BYTES_PER_ELEMENT );

		const uvAccessorId = gltf.meshes[ 0 ].primitives[ 0 ].attributes.TEXCOORD_0;

		if ( gltf.accessors[ uvAccessorId ].componentType != 5126 ) {

			return 0;

		}

		const uvBufferViewID = gltf.accessors[ uvAccessorId ].bufferView;

		const uvs = new Float32Array(
			bin,
			gltf.bufferViews[ uvBufferViewID ].byteOffset,
			gltf.bufferViews[ uvBufferViewID ].byteLength / Float32Array.BYTES_PER_ELEMENT
		);

		const normalAccessorID = gltf.meshes[ 0 ].primitives[ 0 ].attributes.NORMAL;

		if ( gltf.accessors[ normalAccessorID ].componentType != 5126 ) {

			return 0;

		}

		const normalBufferViewID = gltf.accessors[ normalAccessorID ].bufferView;

		const normals = new Float32Array(
			bin,
			gltf.bufferViews[ normalBufferViewID ].byteOffset,
			gltf.bufferViews[ normalBufferViewID ].byteLength / Float32Array.BYTES_PER_ELEMENT
		);

		const indexAccessorID = gltf.meshes[ 0 ].primitives[ 0 ].indices;

		console.log( indexAccessorID );

		if ( gltf.accessors[ indexAccessorID ].componentType != 5123 ) {

			return 0;

		}

		const indexBufferViewID = gltf.accessors[ indexAccessorID ].bufferView;

		const indices = new Uint16Array(
			bin,
			gltf.bufferViews[ indexBufferViewID ].byteOffset,
			gltf.bufferViews[ indexBufferViewID ].byteLength / Uint16Array.BYTES_PER_ELEMENT
		);

		return {
			positions,
			uvs,
			normals,
			indices
		};

	}

	async init() {

		const equi = new Texture( {
			imagePath: "/static/textures/equi-studio.jpg",
			type: this.gl.TEXTURE_2D,
			format: this.gl.RGBA,
			pixelType: this.gl.UNSIGNED_BYTE,
			gl: this.gl
		} );

		equi.loadImage();

		this.assetsLoaded = true;

		// set shader uniforms
		this.lightingShader.activate();
		this.lightingShader.setVector3( "objectColor", vec3.fromValues( 1.0, 1.0, 1.0 ) );
		this.lightingShader.setVector3( "lightColor", vec3.fromValues( 0.95, 1.0, 1.0 ) );

		// setup transforms
		this.cubeTransform = new Transform();
		this.cubeTransform.position = vec3.fromValues( 0, 0, 0 );

		// setup nodes
		this.cubeNode = new Node( {
			arrayBuffer: new ArrayBuffer( { gl: this.gl, vertices, textures: [ equi ], stride: 6 } ),
			transform: this.cubeTransform
		} );

		this.resize();

	}

	resize() {

		const displayWidth = this.gl.canvas.clientWidth;
		const displayHeight = this.gl.canvas.clientHeight;

		// Check if the this.gl.canvas is not the same size.
		const needResize = this.gl.canvas.width !== displayWidth ||
                     this.gl.canvas.height !== displayHeight;

		if ( needResize ) {

			this.gl.canvas.width = displayWidth;
			this.gl.canvas.height = displayHeight;

		}

		this.camera.resize( this.gl.canvas.width, this.gl.canvas.height );

	}

	earlyUpdate( elapsed, delta ) {

		super.earlyUpdate( elapsed, delta );

	}

	update( elapsed, delta ) {

		if ( ! this.assetsLoaded ) return;

		super.update( elapsed, delta );

		this.gl.viewport( 0, 0, this.gl.canvas.width, this.gl.canvas.height );
		this.gl.clearColor( 1, 1, 1, 1 );
		this.gl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT );

		this.camera.update( elapsed, delta );

		this.lightingShader.activate();
		this.lightingShader.setVector3( "viewPosition", this.camera.position );
		this.lightingShader.setFloat( "time", elapsed );

		//this.cubeTransform.rotation[ 1 ] += 0.01;
		//this.cubeNode.updateModelMatrix();

		this.cubeNode.drawTriangles( this.lightingShader, this.camera );

	}

	lateUpdate( elapsed, delta ) {

		super.lateUpdate( elapsed, delta );

	}

}
