import Base from "@webgl/Base";
import { glSettings } from "@webgl/globals/Constants";
import IBO from "../base/IBO";
import VAO from "../base/VAO";
import VBO from "../base/VBO";
import Shader from "../base/Shader";

import vertexShader from "../shaders/default/default.vert";
import fragmentShader from "../shaders/default/default.frag";
import Texture from "../base/Texture";
import { mat4, vec3, } from "gl-matrix";
import Camera from "../base/Camera";

const vertices = [
	- 0.5, 0.0, 0.5, 0.83, 0.70, 0.44,	0.0, 0.0,
	- 0.5, 0.0, - 0.5, 0.83, 0.70, 0.44,	5.0, 0.0,
	0.5, 0.0, - 0.5, 0.83, 0.70, 0.44,	0.0, 0.0,
	0.5, 0.0, 0.5, 0.83, 0.70, 0.44,	5.0, 0.0,
	0.0, 0.8, 0.0, 0.92, 0.86, 0.76,	2.5, 5.0
];

const indices = [
	0, 1, 2,
	0, 2, 3,
	0, 1, 4,
	1, 2, 4,
	2, 3, 4,
	3, 0, 4
];

export default class World extends Base {

	constructor() {

		super();

		this.canvas = document.getElementById( "experience" );
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		this.gl = this.canvas.getContext( "webgl2", { antialias: true } );

		this.gl.viewport( 0, 0, this.gl.canvas.width, this.gl.canvas.height );
		this.gl.enable( this.gl.DEPTH_TEST );

		this.shader = new Shader( { vertexShader, fragmentShader, gl: this.gl } );

		this.texture = new Texture( {
			imagePath: "/static/textures/clouds.jpeg",
			type: this.gl.TEXTURE_2D,
			format: this.gl.RGBA,
			pixelType: this.gl.UNSIGNED_BYTE,
			gl: this.gl
		} );

		this.texture.loadImage();
		this.texture.textureUnit( this.shader, "diffuse", 0 );

		this.vao = new VAO( { gl: this.gl } );
		this.vao.bind();

		this.vbo = new VBO( { vertices, gl: this.gl } );
		this.ibo = new IBO( { indices, gl: this.gl } );

		this.vao.linkAttrib( { vbo: this.vbo, layoutID: 0, numComponents: 3, type: this.gl.FLOAT, stride: 8 * 4, offset: 0 * 4 } );
		this.vao.linkAttrib( { vbo: this.vbo, layoutID: 1, numComponents: 3, type: this.gl.FLOAT, stride: 8 * 4, offset: 3 * 4 } );
		this.vao.linkAttrib( { vbo: this.vbo, layoutID: 2, numComponents: 2, type: this.gl.FLOAT, stride: 8 * 4, offset: 6 * 4 } );

		this.vao.unbind();
		this.vbo.unbind();
		this.ibo.unbind();

		this.camera = new Camera( {
			width: window.innerWidth,
			height: window.innerHeight,
			gl: this.gl,
			position: vec3.fromValues( 0, 1, 5 ),
			near: 0.1,
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

		this.gl.clearColor( 0.08, 0.13, 0.17, 1.0 );
		this.gl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT );

		this.shader.activate();

		this.camera.matrix( elapsed, this.shader );

		this.texture.bind();

		this.vao.bind();

		this.gl.drawElements( this.gl.TRIANGLES, indices.length, this.gl.UNSIGNED_SHORT, 0 );

	}

	lateUpdate( elapsed, delta ) {

		super.lateUpdate( elapsed, delta );

	}

}
