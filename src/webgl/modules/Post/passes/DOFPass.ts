import Shader from "@/webgl/core/Shader";
import { Pass } from "./Pass";

import vertexShader from "./shaders/dof/dof.vert";
import fragmentShader from "./shaders/dof/dof.frag";
import FBO from "@/webgl/core/FBO";
import Bolt from "@/webgl/core/Bolt";

export default class DOFPass extends Pass {

    shader!: Shader;
    bolt!: Bolt;
    t: number;

    constructor( bolt: Bolt, {
    	width = 256,
    	height = 256
    } ) {

    	super( bolt, {
    		width,
    		height,
    	} );

    	this.bolt = bolt;

    	this.shader = new Shader( vertexShader, fragmentShader );
    	this.shader.activate();
    	this.shader.setTexture( "map", this.fbo.targetTexture );
    	this.shader.setFloat( "focus", 610 );
    	this.shader.setFloat( "aperture", 2.1 * 0.0001 );
    	this.shader.setFloat( "maxBlur", 0.005 );

    	this.shader.setFloat( "aspect", this.bolt.gl.canvas.width / this.bolt.gl.canvas.height );

    	this.t = 0;

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

    	this.t ++;

    	this.shader.activate();
    	//this.shader.setFloat( "focus", ( Math.sin( this.t * 0.01 ) ) * 500 );

    	this.fullScreenTriangle.drawTriangles( this.shader );

    	this.fbo.unbind();


    }

}
