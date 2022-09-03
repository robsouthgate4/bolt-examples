
import { Pass } from "./Pass";

import vertexShader from "./shaders/copy/copy.vert";
import fragmentShader from "./shaders/copy/copy.frag";
import Bolt, { Shader, FBO, Texture2D } from "@bolt-webgl/core";

export default class CopyPass extends Pass {

	shader!: Shader;

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

		this.shader = new Shader( vertexShader, fragmentShader );
		this.shader.activate();

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
