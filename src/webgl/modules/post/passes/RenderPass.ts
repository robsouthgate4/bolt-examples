import { Pass } from "./Pass";
import Bolt, { Program } from "@bolt-webgl/core";

export default class RenderPass extends Pass {

	program!: Program;

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
