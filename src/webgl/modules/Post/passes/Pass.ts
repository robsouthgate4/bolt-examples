
import Bolt, { FBO, Mesh, RBO } from "@bolt-webgl/core";
export abstract class Pass {

    fullScreenTriangle: Mesh;
    private _renderToScreen = false;
    _enabled = true;

    constructor( bolt: Bolt, {
    	width = 256,
    	height = 256,
    } ) {

    	const triangleVertices = [
    		- 1, - 1, 0, - 1, 4, 0, 4, - 1, 0
    	];

    	const triangleIndices = [
    		2, 1, 0
    	];

    	this.fullScreenTriangle = new Mesh( {
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

    abstract draw( readFBO: FBO, writeFbo: FBO, renderToScreen?: boolean ): void

}
