
import Example from "@/webgl/examples/basic/gltf-animation";

export default class Main {

	loading: boolean;

	constructor() {

		this.loading = false;

	}

	_start() {

		const example = new Example();
		example.start();

		window.addEventListener( "resize", () => {

			example.resize();

		} );

	}

}
