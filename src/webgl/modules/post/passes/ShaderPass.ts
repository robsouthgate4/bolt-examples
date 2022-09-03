
import { Pass } from "./Pass";
import Bolt, { Shader, FBO, Texture2D } from "@bolt-webgl/core";

interface ShaderPassParams {
	width: number;
	height: number;
	shader: Shader
}

export default class ShaderPass extends Pass {

	shader!: Shader;

	constructor( bolt: Bolt, {
		width = 256,
		height = 256,
		shader
	}: ShaderPassParams ) {

		super( bolt, {
			width,
			height
		} );

		this.shader = shader;

	}

	draw( readFBO: FBO, writeFbo: FBO, texture?: Texture2D, renderToScreen?: boolean ) {

		if ( ! renderToScreen ) {

			writeFbo.bind();

		}

		this.shader.activate();
		this.shader.setTexture( "map", texture ? texture : readFBO.targetTexture );

		this.fullScreenTriangle.draw( this.shader );

		readFBO.unbind();
		writeFbo.unbind();

	}

}
