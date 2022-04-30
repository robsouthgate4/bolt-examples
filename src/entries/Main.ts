
import Example from "@/webgl/examples/advanced/transform-feedback-points";

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
