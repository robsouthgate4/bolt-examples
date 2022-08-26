import Bolt, { Shader, FBO, Texture2D } from "@bolt-webgl/core";
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

    draw( readFBO: FBO, writeFbo: FBO, texture?: Texture2D, renderToScreen?: boolean ) {

    	if ( ! renderToScreen ) {

    		writeFbo.bind();

    	}

    	this.shader.setTexture( "map", texture ? texture : readFBO.targetTexture );

    	this.fullScreenTriangle.draw( this.shader );

    	readFBO.unbind();
    	writeFbo.unbind();

    }

}
