
import { Pass } from "./Pass";
import Bolt, { Program, FBO, Texture2D } from "@bolt-webgl/core";

interface ShaderPassParams {
	width: number;
	height: number;
	program: Program
}

export default class ShaderPass extends Pass {

	program!: Program;

	constructor( bolt: Bolt, {
		width = 256,
		height = 256,
		program
	}: ShaderPassParams ) {

		super( bolt, {
			width,
			height
		} );

		this.program = program;

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
