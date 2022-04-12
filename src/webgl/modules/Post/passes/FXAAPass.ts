
import { Pass } from "./Pass";

import vertexShader from "./shaders/fxaa/fxaa.vert";
import fragmentShader from "./shaders/fxaa/fxaa.frag";
import { vec2 } from "gl-matrix";
import Bolt, { Shader, FBO } from "@bolt-webgl/core";

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

    draw( readFBO?: FBO, renderToScreen?: boolean ) {

    	if ( ! renderToScreen ) {

    		this.fbo.bind();

    	}

    	if ( ! readFBO ) {

    		this.shader.setTexture( "map", this.fbo.targetTexture );

    	} else {

    		this.shader.setTexture( "map", readFBO.targetTexture );

    	}

    	this.fullScreenTriangle.drawTriangles( this.shader );

    	this.fbo.unbind();


    }

}
