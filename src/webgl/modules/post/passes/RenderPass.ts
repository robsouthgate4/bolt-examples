import { Pass } from "./Pass";
import Bolt, { Shader } from "@bolt-webgl/core";

export default class RenderPass extends Pass {

	shader!: Shader;

	constructor( bolt: Bolt, {
		width = 256,
		height = 256,
	} ) {

		super( bolt, {
			width,
			height
		} );

	}

	draw() {

		return;

	}

}
