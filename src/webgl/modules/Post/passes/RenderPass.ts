import Shader from "@/webgl/core/Shader";
import { Pass } from "./Pass";


import Bolt from "@/webgl/core/Bolt";

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
