import Base from "@webgl/Base";
import Shader from "../core/Shader";

import colorVertex from "../core/shaders/color/color.vert";
import colorFragment from "../core/shaders/color/color.frag";

import lightCubeVertex from "../core/shaders/lightCube/lightCube.vert";
import lightCubeFragment from "../core/shaders/lightCube/lightCube.frag";

import { glMatrix, mat4, vec3, } from "gl-matrix";
import CameraFPS from "../core/CameraFPS";
import Texture from "../core/Texture";
import GLNode from "../core/GLNode";
import { loadBinaryBuffer } from "../../utils";
import Transform from "../modules/SceneGraph/Transform";

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

		this.transform = new Transform();
		this.transform.getLocalModelMatrix();

		this.canvas = document.getElementById( "experience" );
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		this.gl = this.canvas.getContext( "webgl2", { antialias: true } );

		this.lightingShader = new Shader( { vertexShader: colorVertex, fragmentShader: colorFragment, gl: this.gl } );
		this.lightCubeShader = new Shader( { vertexShader: lightCubeVertex, fragmentShader: lightCubeFragment, gl: this.gl } );
		this.lightPosition = vec3.fromValues( 0, 5, 5 );

		this.cube;
		this.model;

		this.camera = new CameraFPS( {
			width: window.innerWidth,
			height: window.innerHeight,
			gl: this.gl,
			position: vec3.fromValues( 0, 3, 10 ),
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

		const gltfModelDAta = await this.loadGLTF( `/static/models/gltf/terrain.gltf` );

		this.assetsLoaded = true;

		const diffuseMap = new Texture( {
			imagePath: "/static/models/gltf/terrainBase.jpg",
			type: this.gl.TEXTURE_2D,
			format: this.gl.RGBA,
			pixelType: this.gl.UNSIGNED_BYTE,
			gl: this.gl
		} );

		diffuseMap.loadImage();

		const aoMap = new Texture( {
			imagePath: "/static/models/gltf/AO.png",
			type: this.gl.TEXTURE_2D,
			format: this.gl.RGBA,
			pixelType: this.gl.UNSIGNED_BYTE,
			gl: this.gl
		} );

		aoMap.loadImage();

		const { positions, normals, uvs, indices } = gltfModelDAta;

		// set shader uniforms
		this.lightingShader.activate();
		this.lightingShader.setVector3( "objectColor", vec3.fromValues( 1.0, 1.0, 1.0 ) );
		this.lightingShader.setVector3( "lightColor", vec3.fromValues( 0.95, 1.0, 1.0 ) );
		this.lightingShader.setVector3( "lightPosition", this.lightPosition );

		// setup nodes
		this.cube = new GLNode( { gl: this.gl, vertices, stride: 6 } );
		this.model = new GLNode( { gl: this.gl, textures: [ diffuseMap, aoMap ], positions, normals, uvs, indices, stride: 3 } );

		console.log( this.model );

		this.resize();

	}

	resize() {

		let w = window.innerWidth;
		let h = window.innerHeight;

		this.camera.resize( w, h );

	}

	earlyUpdate( elapsed, delta ) {

		super.earlyUpdate( elapsed, delta );

	}

	update( elapsed, delta ) {

		if ( ! this.assetsLoaded ) return;

		super.update( elapsed, delta );

		this.gl.clearColor( 0, 0, 0, 1 );
		this.gl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT );

		this.camera.update( elapsed, delta );

		this.lightingShader.activate();
		this.lightingShader.setVector3( "viewPosition", this.camera.getPosition() );
		this.lightingShader.setMatrix4( "view", this.camera.getViewMatrix() );
		this.lightingShader.setMatrix4( "projection", this.camera.getProjectionMatrix() );

		const model = mat4.create();
		mat4.fromTranslation( model, vec3.fromValues( 0, 0, 0 ) );
		mat4.scale( model, model, vec3.fromValues( 1, 1, 1 ) );
		mat4.rotate( model, model, glMatrix.toRadian( 45 ), vec3.fromValues( 0, 1, 0 ) );
		this.lightingShader.setMatrix4( "model", model );

		this.model.drawTriangles( this.lightingShader );

		this.lightCubeShader.activate();
		this.lightCubeShader.setMatrix4( "view", this.camera.getViewMatrix() );
		this.lightCubeShader.setMatrix4( "projection", this.camera.getProjectionMatrix() );
		this.lightCubeShader.setVector3( "lightColor", vec3.fromValues( 0, 0, 0 ) );

		mat4.fromTranslation( model, this.lightPosition );
		mat4.rotate( model, model, 1, vec3.fromValues( 0, 1, 0 ) );
		mat4.scale( model, model, vec3.fromValues( 0.2, 0.2, 0.2 ) );
		this.lightCubeShader.setMatrix4( "model", model );

		this.cube.drawTriangles();

	}

	lateUpdate( elapsed, delta ) {

		super.lateUpdate( elapsed, delta );

	}

}
