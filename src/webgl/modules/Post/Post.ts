

import Bolt, { FBO } from "@bolt-webgl/core";
import { Pass } from "./passes/Pass";
import RenderPass from "./passes/RenderPass";

export default class Post {

    _height: number;
    _width: number;
    _passes: Pass[] = [];
    bolt: Bolt;
    private _readFbo!: FBO;
    private _writeFbo!: FBO;

    constructor( bolt: Bolt ) {

    	this.bolt = bolt;

    	this._width = window.innerWidth;
    	this._height = window.innerHeight;

    	// TODO: convert to read and write buffer logic


    	this._readFbo = new FBO( { width: this._width, height: this._height } );
    	this._writeFbo = new FBO( { width: this._width, height: this._height } );

    	this._passes = [];

    }

    add( pass: Pass, renderToScreen = false ) {

    	pass.renderToScreen = renderToScreen;
    	this._passes.push( pass );

    	return this;

    }

    resize( width: number, height: number ) {

    	this._passes.forEach( ( pass: Pass ) => {

    		pass.fbo.resize( width, height );
    		pass.rbo.resize( width, height );

    	} );

    }

    swap() {

    	let temp = this._readFbo;
    	this._readFbo = this._writeFbo;
    	this._writeFbo = temp;

    }

    begin() {

    	const enabledPasses = this._passes.filter( pass => pass.enabled );

    	enabledPasses.forEach( ( pass: Pass ) => {

    		if ( pass instanceof RenderPass ) {

    			pass.fbo.bind();

    			if ( pass.renderToScreen ) {

    				pass.fbo.unbind();

    			}

    		}

    	} );

    	this.bolt.enableDepth();

    }

    end() {

    	this.bolt.disableDepth();

    	const enabledPasses = this._passes.filter( pass => pass.enabled );

    	enabledPasses.forEach( ( pass: Pass, index: number ) => {

    		if ( pass instanceof RenderPass ) {

    			pass.fbo.unbind();

    		} else {

    			pass.draw( enabledPasses[ index - 1 ].fbo, pass.renderToScreen );

    		}

    	} );

    }

}
