import { Pass } from "./Pass";

import vertexShader from "./shaders/pixelate/pixelate.vert";
import fragmentShader from "./shaders/pixelate/pixelate.frag";
import Bolt, { Program, FBO, Texture2D } from "@bolt-webgl/core";


export default class PixelatePass extends Pass {

	program!: Program;
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

		this.program = new Program( vertexShader, fragmentShader );
		this.program.activate();
		this.program.setFloat( "xPixels", this._xPixels );
		this.program.setFloat( "yPixels", this._yPixels );

	}

	set pixelCountX( x: number ) {

		this._xPixels = x;
		this.program.activate();
		this.program.setFloat( "xPixels", x );

	}

	set pixelCountY( y: number ) {

		this._yPixels = y;
		this.program.activate();
		this.program.setFloat( "yPixels", y );

	}

	draw( readFBO: FBO, writeFbo: FBO, texture?: Texture2D, renderToScreen?: boolean ) {

		if ( ! renderToScreen ) {

			writeFbo.bind();

		}

		this.program.setTexture( "map", texture ? texture : readFBO.targetTexture );

		this.fullScreenTriangle.draw( this.program );

		readFBO.unbind();
		writeFbo.unbind();


	}

}
