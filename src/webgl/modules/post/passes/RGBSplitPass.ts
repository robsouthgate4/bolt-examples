import Bolt, { Program, FBO, Texture2D } from "@bolt-webgl/core";
import { Pass } from "./Pass";

import vertexShader from "./shaders/rgbSplit/rgbSplit.vert";
import fragmentShader from "./shaders/rgbSplit/rgbSplit.frag";

export default class RGBSplitPass extends Pass {

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

	}

	draw( readFBO: FBO, writeFbo: FBO, texture?: Texture2D, renderToScreen?: boolean ) {

		if ( ! renderToScreen ) {

			writeFbo.bind();

		}

		this.program.setTexture( "map", texture ? texture : readFBO.targetTexture );

		this.fullScreenTriangle.draw( this.program );

		readFBO.unbind();
		writeFbo.unbind();

	}

}
