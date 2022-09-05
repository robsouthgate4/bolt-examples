import { Pass } from "./Pass";

import vertexShader from "./shaders/dof/dof.vert";
import fragmentShader from "./shaders/dof/dof.frag";
import Bolt, { Program, FBO, Texture2D } from "@bolt-webgl/core";
export default class DOFPass extends Pass {

	program!: Program;
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

		this.program = new Program( vertexShader, fragmentShader );
		this.program.activate();
		this.program.setFloat( "focus", 610 );
		this.program.setFloat( "aperture", 3.1 * 0.0001 );
		this.program.setFloat( "maxBlur", 0.005 );

		this.program.setFloat( "aspect", this.gl.canvas.width / this.gl.canvas.height );

		this.t = 0;

	}

	draw( readFBO: FBO, writeFbo: FBO, texture?: Texture2D, renderToScreen?: boolean ) {

		if ( ! renderToScreen ) {

			writeFbo.bind();

		}

		this.program.activate();
		this.program.setTexture( "map", texture ? texture : readFBO.targetTexture );

		this.fullScreenTriangle.draw( this.program );

		readFBO.unbind();
		writeFbo.unbind();


	}

}
