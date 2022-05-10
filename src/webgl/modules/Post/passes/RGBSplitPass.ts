import Bolt, { Shader, FBO } from "@bolt-webgl/core";
import { Pass } from "./Pass";

import vertexShader from "./shaders/rgbSplit/rgbSplit.vert";
import fragmentShader from "./shaders/rgbSplit/rgbSplit.frag";

export default class RGBSplitPass extends Pass {

    shader!: Shader;

    constructor( bolt: Bolt, {
    	width = 256,
    	height = 256
    } ) {

    	super( bolt, {
    		width,
    		height
    	} );

    	this.shader = new Shader( vertexShader, fragmentShader );

    }

    draw( readFBO: FBO, writeFbo: FBO, renderToScreen?: boolean ) {

    	if ( ! renderToScreen ) {

    		writeFbo.bind();

    	}

    	this.shader.setTexture( "map", readFBO.targetTexture );

    	this.fullScreenTriangle.draw( this.shader );

    	readFBO.unbind();
    	writeFbo.unbind();

    }

}
