
import Example from "@/webgl/examples/advanced/depth-of-field";

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
