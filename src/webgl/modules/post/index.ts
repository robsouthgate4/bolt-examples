

import Bolt, { FBO, RBO } from "@bolt-webgl/core";
import { Pass } from "./passes/Pass";

export default class Post {

	_height: number;
	_width: number;
	_passes: Pass[] = [];
	bolt: Bolt;
	private _readFbo!: FBO;
	private _writeFbo!: FBO;
	private _writeRBO: RBO;
	private _readRBO: RBO;

	constructor( bolt: Bolt ) {

		this.bolt = bolt;

		this._width = window.innerWidth;
		this._height = window.innerHeight;

		this._readFbo = new FBO( { width: this._width, height: this._height } );
		this._readFbo.bind();
		this._readRBO = new RBO( { width: this._width, height: this._height } );
		this._readFbo.unbind();

		this._writeFbo = new FBO( { width: this._width, height: this._height } );
		this._writeFbo.bind();
		this._writeRBO = new RBO( { width: this._width, height: this._height } );
		this._writeFbo.unbind();

		this._passes = [];

	}

	add( pass: Pass, renderToScreen = false ) {

		pass.renderToScreen = renderToScreen;
		this._passes.push( pass );

		return this;

	}

	resize( width: number, height: number ) {

		this._readFbo.resize( width, height );
		this._writeFbo.resize( width, height );
		this._readRBO.resize( width, height );
		this._writeRBO.resize( width, height );

	}

	swap() {

		let temp = this._readFbo;
		this._readFbo = this._writeFbo;
		this._writeFbo = temp;

	}

	begin() {


		this.bolt.enableDepth();
		this.bolt.enableCullFace();
		this._readFbo.bind();

	}

	end() {

		this._readFbo.unbind();

		this.bolt.disableDepth();
		this.bolt.disableCullFace();

		const enabledPasses = this._passes.filter( pass => pass.enabled );

		enabledPasses.forEach( ( pass: Pass ) => {

			pass.draw( this._readFbo, this._writeFbo, pass.texture, pass.renderToScreen );

			this.swap();

		} );

	}

}
