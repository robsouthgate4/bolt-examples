
import Bolt, { FBO, Mesh, Texture2D } from "@bolt-webgl/core";
export abstract class Pass {

    private _fullScreenTriangle!: Mesh;
    private _renderToScreen = false;
    private _enabled = true;

    protected _texture: Texture2D | undefined;

    constructor( bolt: Bolt, {
    	width = 256,
    	height = 256,
    	texture
    }: { width: number, height: number, texture?: Texture2D } ) {

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

    	this._texture = texture || undefined;

    }

    setEnabled( val: boolean ) {

    	this._enabled = val;

    	return this;

    }

    set enabled( val: boolean ) {

    	this._enabled = val;

    }

    get enabled() {

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

    public get texture(): Texture2D | undefined {

    	return this._texture;

    }

    abstract draw( readFBO: FBO, writeFbo: FBO, texture?: Texture2D, renderToScreen?: boolean ): void

}
