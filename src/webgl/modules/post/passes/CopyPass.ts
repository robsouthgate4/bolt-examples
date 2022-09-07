
import { Pass } from "./Pass";

import vertexShader from "./shaders/copy/copy.vert";
import fragmentShader from "./shaders/copy/copy.frag";
import Bolt, { Program, FBO, Texture2D } from "@bolt-webgl/core";

export default class CopyPass extends Pass {

	program!: Program;

	constructor( bolt: Bolt, {
		width = 256,
		height = 256,
		texture
	}: { width: number, height: number, texture?: Texture2D } ) {

		super( bolt, {
			width,
			height,
			texture
		} );

		this._texture = texture;

		this.program = new Program( vertexShader, fragmentShader );
		this.program.activate();

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
