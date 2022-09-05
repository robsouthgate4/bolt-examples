
import { Pass } from "./Pass";

import vertexShader from "./shaders/fxaa/fxaa.vert";
import fragmentShader from "./shaders/fxaa/fxaa.frag";
import { vec2 } from "gl-matrix";
import Bolt, { Program, FBO, Texture2D } from "@bolt-webgl/core";

export default class FXAAPass extends Pass {

	program!: Program;

	constructor( bolt: Bolt, {
		width = 256,
		height = 256
	} ) {

		super( bolt, {
			width,
			height
		} );

		this.program = new Program( vertexShader, fragmentShader );
		this.program.activate();
		this.program.setVector2( "resolution", vec2.fromValues( width, height ) );

	}

	draw( readFBO: FBO, writeFbo: FBO, texture?: Texture2D, renderToScreen?: boolean ) {

		if ( ! renderToScreen ) {

			writeFbo.bind();

		}

		this.program.activate();
		this.program.setTexture( "map", texture ? texture : readFBO.targetTexture );

		this.fullScreenTriangle.draw( this.program );

		readFBO.unbind();
		writeFbo.unbind();

	}

}
