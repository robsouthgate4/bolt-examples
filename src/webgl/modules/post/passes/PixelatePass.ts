import { Pass } from "./Pass";

import vertexShader from "./shaders/pixelate/pixelate.vert";
import fragmentShader from "./shaders/pixelate/pixelate.frag";
import Bolt, { Shader, FBO } from "@bolt-webgl/core";

export default class PixelatePass extends Pass {

    shader!: Shader;
    private _xPixels: number;
    private _yPixels: number;

    constructor( bolt: Bolt, {
    	width = 256,
    	height = 256,
    	xPixels = 50,
    	yPixels = 50
    } ) {

    	super( bolt, {
    		width,
    		height
    	} );

    	this._xPixels = xPixels;
    	this._yPixels = yPixels;

    	this.shader = new Shader( vertexShader, fragmentShader );
    	this.shader.activate();
    	this.shader.setFloat( "xPixels", this._xPixels );
    	this.shader.setFloat( "yPixels", this._yPixels );

    }

    set pixelCountX( x: number ) {

    	this._xPixels = x;
    	this.shader.activate();
    	this.shader.setFloat( "xPixels", x );

    }

    set pixelCountY( y: number ) {

    	this._yPixels = y;
    	this.shader.activate();
    	this.shader.setFloat( "yPixels", y );

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
