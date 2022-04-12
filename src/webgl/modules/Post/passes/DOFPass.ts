import { Pass } from "./Pass";

import vertexShader from "./shaders/dof/dof.vert";
import fragmentShader from "./shaders/dof/dof.frag";
import Bolt, { Shader, FBO } from "@bolt-webgl/core";
export default class DOFPass extends Pass {

    shader!: Shader;
    bolt!: Bolt;
    t: number;
    gl: WebGL2RenderingContext;

    constructor( bolt: Bolt, {
    	width = 256,
    	height = 256
    } ) {

    	super( bolt, {
    		width,
    		height,
    	} );

    	this.bolt = bolt;

    	this.gl = this.bolt.getContext();

    	this.shader = new Shader( vertexShader, fragmentShader );
    	this.shader.activate();
    	this.shader.setTexture( "map", this.fbo.targetTexture );
    	this.shader.setFloat( "focus", 610 );
    	this.shader.setFloat( "aperture", 3.1 * 0.0001 );
    	this.shader.setFloat( "maxBlur", 0.005 );

    	this.shader.setFloat( "aspect", this.gl.canvas.width / this.gl.canvas.height );

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
    	this.fullScreenTriangle.drawTriangles( this.shader );

    	this.fbo.unbind();


    }

}
