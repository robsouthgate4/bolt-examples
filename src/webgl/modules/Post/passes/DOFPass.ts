import Shader from "@/webgl/core/Shader";
import { Pass } from "./Pass";

import vertexShader from "./shaders/dof/dof.vert";
import fragmentShader from "./shaders/dof/dof.frag";
import FBO from "@/webgl/core/FBO";
import Bolt from "@/webgl/core/Bolt";
import { vec2 } from "gl-matrix";

export default class DOFPass extends Pass {

    shader!: Shader;

    constructor( bolt: Bolt, {
    	width = 256,
    	height = 256
    } ) {

    	super( bolt, {
    		width,
    		height,
    	} );

    	this.shader = new Shader( vertexShader, fragmentShader );
    	this.shader.activate();
    	this.shader.setTexture( "map", this.fbo.targetTexture );

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
