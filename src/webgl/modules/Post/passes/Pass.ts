
import Bolt, { FBO, ArrayBuffer, RBO } from "@robsouthgate/bolt-core";
export abstract class Pass {

    fbo: FBO;
    rbo: RBO;
    fullScreenTriangle: ArrayBuffer;
    private _renderToScreen = false;
    _enabled = true;

    constructor( bolt: Bolt, {
    	width = 256,
    	height = 256,
    } ) {

    	this.fbo = new FBO( { width, height } );
    	this.fbo.bind();

    	this.rbo = new RBO( { width, height } );
    	this.fbo.unbind();

    	const triangleVertices = [
    		- 1, - 1, 0, - 1, 4, 0, 4, - 1, 0
    	];

    	const triangleIndices = [
    		2, 1, 0
    	];

    	this.fullScreenTriangle = new ArrayBuffer( {
    		positions: triangleVertices,
    		indices: triangleIndices
    	} );

    }

    setEnabled( val: boolean ) {

    	this._enabled = val;

    	return this;

    }

    get enabled( ) {

    	return this._enabled;

    }

    set renderToScreen( val: boolean ) {

    	this._renderToScreen = val;

    }

    get renderToScreen(): boolean {

    	return this._renderToScreen;

    }

    abstract draw( readFBO?: FBO, renderToScreen?: boolean ): void

}
