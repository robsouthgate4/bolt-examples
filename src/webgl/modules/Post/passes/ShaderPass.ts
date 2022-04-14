
import { Pass } from "./Pass";
import Bolt, { Shader, FBO } from "@bolt-webgl/core";

interface ShaderPassParams {
    width: number;
    height: number;
    shader: Shader
}

export default class ShaderPass extends Pass {

    shader!: Shader;

    constructor( bolt: Bolt, {
    	width = 256,
    	height = 256,
    	shader
    }: ShaderPassParams ) {

    	super( bolt, {
    		width,
    		height
    	} );

    	this.shader = shader;

    }

    draw( readFBO: FBO, writeFbo: FBO, renderToScreen?: boolean ) {

    	if ( ! renderToScreen ) {

    		writeFbo.bind();

    	}

    	this.shader.activate();
    	this.shader.setTexture( "map", readFBO.targetTexture );

    	this.fullScreenTriangle.drawTriangles( this.shader );

    	readFBO.unbind();
    	writeFbo.unbind();

    }

}
