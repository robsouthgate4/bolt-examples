import Base from "@webgl/Base";
import VAO from "../base/VAO";
import VBO from "../base/VBO";
import IBO from "../base/IBO";
import Shader from "../base/Shader";

import colorVertex from "../base/shaders/color/color.vert";
import colorFragment from "../base/shaders/color/color.frag";

import lightCubeVertex from "../base/shaders/lightCube/lightCube.vert";
import lightCubeFragment from "../base/shaders/lightCube/lightCube.frag";

import { mat4, vec3, } from "gl-matrix";
import CameraFPS from "../base/CameraFPS";
import Texture from "../base/Texture";
import GLNode from "../base/Node";

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

		this.canvas = document.getElementById( "experience" );
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		this.gl = this.canvas.getContext( "webgl2", { antialias: true } );

		this.foXTexture;
		this.foxPositionVBO;
		this.foxNormalVBO;
		this.foxUVVBO;
		this.foxVAO;

		this.lightingShader;
		this.lightCubeShader;
		this.lightPosition;
		this.lightCubeShader;

		this.cube;

		this.camera;

		this.gl.viewport( 0, 0, this.gl.canvas.width, this.gl.canvas.height );
		this.gl.enable( this.gl.DEPTH_TEST );
		this.gl.pixelStorei( this.gl.UNPACK_FLIP_Y_WEBGL, true );

		this.init();

	}

	async init() {

		const modelData = await ( await fetch( `/static/models/json/fox.json` ) ).json();

		this.assetsLoaded = true;

		this.lightPosition = vec3.fromValues( 0, 5, 5 );

		this.camera = new CameraFPS( {
			width: window.innerWidth,
			height: window.innerHeight,
			gl: this.gl,
			position: vec3.fromValues( 0, 3, 10 ),
			near: 0.01,
			far: 1000,
			fov: 45
		} );

		this.foXTexture = new Texture( {
			imagePath: "/static/textures/fox.jpeg",
			type: this.gl.TEXTURE_2D,
			format: this.gl.RGBA,
			pixelType: this.gl.UNSIGNED_BYTE,
			gl: this.gl
		} );

		this.foXTexture.loadImage();

		const { position, normal, uv } = modelData;

		// setup shaders

		this.lightingShader = new Shader( { vertexShader: colorVertex, fragmentShader: colorFragment, gl: this.gl } );
		this.lightCubeShader = new Shader( { vertexShader: lightCubeVertex, fragmentShader: lightCubeFragment, gl: this.gl } );

		this.foXTexture.textureUnit( this.lightingShader, "diffuseMap", 0 );

		// setup nodes

		this.cube = new GLNode( { vertices, gl: this.gl, stride: 6 } );
		this.fox = new GLNode( { gl: this.gl, positions: position, normals: normal, uvs: uv, stride: 3 } );

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

		this.gl.clearColor( 1, 1, 1, 1 );
		this.gl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT );

		this.camera.update( elapsed, delta );

		this.lightingShader.activate();
		this.lightingShader.setVector3( "objectColor", vec3.fromValues( 1.0, 1.0, 1.0 ) );
		this.lightingShader.setVector3( "lightColor", vec3.fromValues( 1.0, 1.0, 1.0 ) );
		this.lightingShader.setVector3( "viewPosition", this.camera.getPosition() );
		this.lightingShader.setVector3( "lightPosition", this.lightPosition );
		this.lightingShader.setMatrix4( "view", this.camera.getViewMatrix() );
		this.lightingShader.setMatrix4( "projection", this.camera.getProjectionMatrix() );

		const model = mat4.create();
		mat4.fromTranslation( model, vec3.fromValues( 0, 0, 0 ) );
		mat4.rotate( model, model, 1, vec3.fromValues( 0, 1, 0 ) );
		this.lightingShader.setMatrix4( "model", model );

		this.foXTexture.bind();
		this.fox.draw();

		this.lightCubeShader.activate();
		this.lightCubeShader.setMatrix4( "view", this.camera.getViewMatrix() );
		this.lightCubeShader.setMatrix4( "projection", this.camera.getProjectionMatrix() );
		this.lightCubeShader.setVector3( "lightColor", vec3.fromValues( 0, 0, 0 ) );

		mat4.fromTranslation( model, this.lightPosition );
		mat4.rotate( model, model, 1, vec3.fromValues( 0, 1, 0 ) );
		mat4.scale( model, model, vec3.fromValues( 0.2, 0.2, 0.2 ) );
		this.lightCubeShader.setMatrix4( "model", model );

		this.cube.draw();


	}

	lateUpdate( elapsed, delta ) {

		super.lateUpdate( elapsed, delta );

	}

}
