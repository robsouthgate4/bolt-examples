
import { Pass } from "@/webgl/modules/post/passes/Pass";

import vertexShader from "./shaders/composition/composition.vert";
import fragmentShader from "./shaders/composition/composition.frag";
import Bolt, { Shader, FBO, Texture2D } from "@bolt-webgl/core";

export default class CompositionPass extends Pass {

	shader!: Shader;
	private _depthTexture!: Texture2D;

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

		if ( this._depthTexture! == undefined ) {

			this.shader.setTexture( "mapDepth", this._depthTexture );

		}

		this.fullScreenTriangle.draw( this.shader );

		readFBO.unbind();
		writeFbo.unbind();

	}

	public get depthTexture(): Texture2D {

		return this._depthTexture;

	}

	public set depthTexture( value: Texture2D ) {

		this._depthTexture = value;

	}

}
