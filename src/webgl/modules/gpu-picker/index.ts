import { FBO, RBO } from "@bolt-webgl/core";

export default class GPUPicker {

    private _fbo: FBO;
    private _rbo: RBO;

    constructor( { width = 500, height = 500 } ) {

    	this._fbo = new FBO( { width, height, } );
    	this._fbo.bind();
    	this._rbo = new RBO( { width, height } );
    	this._fbo.unbind();

    }

    resize( width: number, height: number ) {

    	this._fbo.resize( width, height );
    	this._rbo.resize( width, height );

    }

}
