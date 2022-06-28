
import Bolt, { FBO, Mesh } from "@bolt-webgl/core";
export abstract class Pass {

    private _fullScreenTriangle!: Mesh;
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

    set enabled( val: boolean ) {

    	this._enabled = val;

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

    public get fullScreenTriangle(): Mesh {

    	return this._fullScreenTriangle;

    }

    public set fullScreenTriangle( value: Mesh ) {

    	this._fullScreenTriangle = value;

    }

    abstract draw( readFBO: FBO, writeFbo: FBO, renderToScreen?: boolean ): void

}
