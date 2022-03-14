import ArrayBuffer from "@/webgl/core/ArrayBuffer";
import Bolt from "@/webgl/core/Bolt";
import FBO from "@/webgl/core/FBO";
import RBO from "@/webgl/core/RBO";

export abstract class Pass {

    fbo: FBO;
    rbo: RBO;
    fullScreenTriangle: ArrayBuffer;
    private _renderToScreen = false;

    constructor( bolt: Bolt, {
    	width = 256,
    	height = 256
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

    set renderToScreen( val: boolean ) {

    	this._renderToScreen = val;

    }

    get renderToScreen(): boolean {

    	return this._renderToScreen;

    }

    abstract draw( readFBO?: FBO, renderToScreen?: boolean ): void

}
