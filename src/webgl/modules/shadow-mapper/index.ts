import Bolt, { BACK, Camera, DrawSet, FBO, FRONT, Node, Program } from "@bolt-webgl/core";
import { mat4 } from "gl-matrix";

import depthVertex from "./shaders/depth/depth.vert";
import depthFragment from "./shaders/depth/depth.frag";

interface ShadowMapperParams {
	bolt: Bolt,
	light: Camera,
	nodes?: DrawSet[],
	width?: number,
	height?: number
}

interface DrawCacheItem {
	initialProgram: Program,
	drawset: DrawSet;
}

export default class ShadowMapper {

	private _light: Camera;
	private _drawCache: DrawCacheItem[] = [];
	private _height: number;
	private _width: number;
	private _fbo: FBO;
	private _lightSpaceMatrix: mat4;
	private _depthProgram: Program;
	private _bolt: Bolt;
	private _gl: WebGL2RenderingContext;

	constructor( {
		bolt,
		light,
		width = 512,
		height = 512
	}: ShadowMapperParams ) {

		this._bolt = bolt;
		this._gl = bolt.getContext();

		this._light = light;

		this._width = width;
		this._height = height;

		this._fbo = new FBO( { width: 1024, height: 1024, depth: true } );

		this._lightSpaceMatrix = mat4.create();
		mat4.multiply( this._lightSpaceMatrix, this._light.projection, this._light.view );

		this._depthProgram = new Program( depthVertex, depthFragment );
		this._depthProgram.activate();
		this._depthProgram.setMatrix4( "lightSpaceMatrix", this._lightSpaceMatrix );

	}
	/**
	 * @param  {Node} drawSet drawSet to be rendered into shadow map
	 */
	add( node: Node ) {

		// node.traverse( ( node: Node ) => {

		// 	if ( node instanceof DrawSet ) {

		// 		node.program.activate();
		// 		node.program.setMatrix4( "lightSpaceMatrix", this._lightSpaceMatrix );
		// 		node.program.setVector3( "lightPosition", this._light.position );
		// 		node.program.setTexture( "shadowMap", this._fbo.depthTexture );

		// 		this._drawCache.push( {
		// 			initialProgram: node.program,
		// 			drawset: node
		// 		} );

		// 	}

		// } );

		// drawset.program.activate();
		// drawset.program.setMatrix4( "lightSpaceMatrix", this._lightSpaceMatrix );
		// drawset.program.setVector3( "lightPosition", this._light.position );
		// drawset.program.setTexture( "shadowMap", this._fbo.depthTexture );

		// this._drawCache.push( { initialProgram: drawset.program, drawset: drawset } );

	}

	resize( width: number, height: number ) {

		this._fbo.resize( width, height );

	}

	private _setDepthShader() {



	}

	private _overrideDefault() {



	}

	draw( nodes: Node[] ) {

		this._drawCache = [];

		//this._drawCache.push( ...nodes );

		{

			this._fbo.bind();

			this._bolt.enableCullFace();
			this._bolt.cullFace( FRONT );

			this._bolt.clear( 0, 0, 0, 0 );

			// for ( let i = this._drawCache.length - 1; i >= 0; i -- ) {

			// 	const drawGroup = this._drawCache[ i ];
			// 	drawGroup.drawset.program = this._depthProgram;
			// 	drawGroup.drawset.updateModelMatrix();
			// 	this._bolt.draw( drawGroup.drawset );

			// }
			// nodes[ 0 ].traverse( ( node: Node ) => {

			// 	if ( node instanceof DrawSet ) {

			// 		node.program = this._depthProgram;

			// 	}


			// } );

			nodes.forEach( ( node: Node ) => {

				node.traverse( ( node: Node ) => {

					if ( node instanceof DrawSet ) {

						node.program = this._depthProgram;

					}


				} );

				this._bolt.draw( node );

			} );

			// for ( let i = this._drawCache.length - 1; i >= 0; i -- ) {

			// 	const drawGroup = this._drawCache[ i ];
			// 	drawGroup.drawset.program = this._depthProgram;
			// 	drawGroup.drawset.updateModelMatrix();
			// 	this._bolt.draw( drawGroup.drawset );

			// }

			this._fbo.unbind();

			this._bolt.cullFace( BACK );
			this._bolt.disableCullFace();

		}

		{

			// for ( let i = this._drawCache.length - 1; i >= 0; i -- ) {

			// 	const drawGroup = this._drawCache[ i ];
			// 	drawGroup.drawset.program = drawGroup.initialProgram;
			// 	drawGroup.drawset.program.activate();

			// }

		}

	}

}
