
import { Pass } from "./Pass";

import vertexShader from "./shaders/fxaa/fxaa.vert";
import fragmentShader from "./shaders/fxaa/fxaa.frag";
import { vec2 } from "gl-matrix";
import Bolt, { Shader, FBO, Texture2D } from "@bolt-webgl/core";

export default class FXAAPass extends Pass {

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
    	this.shader.setVector2( "resolution", vec2.fromValues( width, height ) );

    }

    draw( readFBO: FBO, writeFbo: FBO, texture?: Texture2D, renderToScreen?: boolean ) {

    	if ( ! renderToScreen ) {

    		writeFbo.bind();

    	}

    	this.shader.activate();
    	this.shader.setTexture( "map", texture ? texture : readFBO.targetTexture );

    	this.fullScreenTriangle.draw( this.shader );

    	readFBO.unbind();
    	writeFbo.unbind();

    }

}
