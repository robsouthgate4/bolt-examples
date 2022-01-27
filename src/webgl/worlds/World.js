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

		this.cubeVBO;
		this.lightCubeShader;

		this.camera;

		this.gl.viewport( 0, 0, this.gl.canvas.width, this.gl.canvas.height );
		this.gl.enable( this.gl.DEPTH_TEST );
		this.gl.pixelStorei( this.gl.UNPACK_FLIP_Y_WEBGL, true );

		this.init();

	}

	async init() {

		const modelData = await ( await fetch( `/static/models/json/fox.json` ) ).json();

		this.foXTexture = new Texture( {
			imagePath: "/static/textures/fox.jpeg",
			type: this.gl.TEXTURE_2D,
			format: this.gl.RGBA,
			pixelType: this.gl.UNSIGNED_BYTE,
			gl: this.gl
		} );

		this.foXTexture.loadImage();

		const { position, normal, uv } = modelData;

		this.lightingShader = new Shader( { vertexShader: colorVertex, fragmentShader: colorFragment, gl: this.gl } );
		this.lightCubeShader = new Shader( { vertexShader: lightCubeVertex, fragmentShader: lightCubeFragment, gl: this.gl } );

		// fox setup

		this.foXTexture.textureUnit( this.lightingShader, "diffuseMap", 0 );

		this.foxPositionVBO = new VBO( { data: position, gl: this.gl } );
		this.foxNormalVBO = new VBO( { data: normal, gl: this.gl } );
		this.foxUVVBO = new VBO( { data: uv, gl: this.gl } );

		this.foxVAO = new VAO( { gl: this.gl } );
		this.foxVAO.bind();
		this.foxVAO.linkAttrib( { vbo: this.foxPositionVBO, layoutID: 0, numComponents: 3, type: this.gl.FLOAT, stride: 3 * 4, offset: 0 * 4 } );
		this.foxVAO.linkAttrib( { vbo: this.foxNormalVBO, layoutID: 1, numComponents: 3, type: this.gl.FLOAT, stride: 3 * 4, offset: 0 * 4 } );
		this.foxVAO.linkAttrib( { vbo: this.foxUVVBO, layoutID: 2, numComponents: 2, type: this.gl.FLOAT, stride: 2 * 4, offset: 0 * 4 } );
		this.foxVAO.unbind();

		// cube setup

		this.cubeVBO = new VBO( { data: vertices, gl: this.gl } );

		this.lightCubeVao = new VAO( { gl: this.gl } );
		this.lightCubeVao.bind();
		this.lightCubeVao.linkAttrib( { vbo: this.cubeVBO, layoutID: 0, numComponents: 3, type: this.gl.FLOAT, stride: 6 * 4, offset: 0 * 4 } );
		this.lightCubeVao.linkAttrib( { vbo: this.cubeVBO, layoutID: 1, numComponents: 3, type: this.gl.FLOAT, stride: 6 * 4, offset: 3 * 4 } );
		this.lightCubeVao.unbind();

		this.foxPositionVBO.unbind();
		this.cubeVBO.unbind();

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

		super.update( elapsed, delta );

		if ( ! this.cubeVBO ) return;

		this.gl.clearColor( 1, 1, 1, 1 );
		this.gl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT );

		this.camera.update( elapsed, delta );

		this.lightingShader.activate();

		this.foXTexture.bind();
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

		this.foxVAO.bind();
		this.gl.drawArrays( this.gl.TRIANGLES, 0, 8822 / 3 );

		this.lightCubeShader.activate();
		this.lightCubeShader.setMatrix4( "view", this.camera.getViewMatrix() );
		this.lightCubeShader.setMatrix4( "projection", this.camera.getProjectionMatrix() );
		this.lightCubeShader.setVector3( "lightColor", vec3.fromValues( 1, 1, 0.7 ) );

		mat4.fromTranslation( model, this.lightPosition );
		mat4.rotate( model, model, 1, vec3.fromValues( 0, 1, 0 ) );
		mat4.scale( model, model, vec3.fromValues( 0.2, 0.2, 0.2 ) );
		this.lightCubeShader.setMatrix4( "model", model );

		this.lightCubeVao.bind();
		this.gl.drawArrays( this.gl.TRIANGLES, 0, 36 );

	}

	lateUpdate( elapsed, delta ) {

		super.lateUpdate( elapsed, delta );

	}

}
