
import { Pass } from "./Pass";

import vertexShader from "./shaders/copy/copy.vert";
import fragmentShader from "./shaders/copy/copy.frag";
import Bolt, { Shader, FBO } from "@bolt-webgl/core";

export default class CopyPass extends Pass {

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
    	this.shader.activate();

    }

    draw( readFBO: FBO, writeFbo: FBO, renderToScreen?: boolean ) {

    	if ( ! renderToScreen ) {

    		writeFbo.bind();

    	}


    	this.shader.activate();
    	this.shader.setTexture( "map", readFBO.targetTexture );

    	this.fullScreenTriangle.draw( this.shader );

    	readFBO.unbind();
    	writeFbo.unbind();

    }

}
