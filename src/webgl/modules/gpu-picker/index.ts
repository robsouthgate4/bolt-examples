import Bolt, { Batch, FBO, Node, RBO, RGBA, Shader, UNSIGNED_BYTE } from "@bolt-webgl/core";
import { vec2, vec4 } from "gl-matrix";
import fragmentShader from "./shaders/picking.frag";
import vertexShader from "./shaders/picking.vert";

export interface PickingData {
    batch: Batch,
    id: number,
    initialShader: Shader
}

export default class GPUPicker {

    private _fbo: FBO;
    private _rbo: RBO;
    private _pickingShader!: Shader;
    private _bolt: Bolt;
    private _canvas: HTMLCanvasElement;
    private _pickingDataArray: PickingData[] = [];
    private _gl: WebGL2RenderingContext;
    private _currentPickingID: number = - 1;

    constructor( bolt: Bolt, { width = 256, height = 256 } ) {

    	this._bolt = bolt;
    	this._gl = this._bolt.getContext();
    	this._canvas = this._gl.canvas;

    	this._fbo = new FBO( { width, height, } );
    	this._fbo.bind();
    	this._rbo = new RBO( { width, height } );
    	this._fbo.unbind();
    	this._rbo.unbind();

    	this._pickingShader = new Shader( vertexShader, fragmentShader );

    }

    _getPickedID( mouse: vec2 ) {

    	const pixelX = mouse[ 0 ] * this._canvas.width / this._canvas.clientWidth;
    	const pixelY = this._gl.canvas.height - mouse[ 1 ] * this._gl.canvas.height / this._gl.canvas.clientHeight - 1;
    	const data = new Uint8Array( 4 );

    	this._gl.readPixels(
    		pixelX,
    		pixelY,
    		1,
    		1,
    		RGBA,
    		UNSIGNED_BYTE,
    		data
    	);

    	let id = data[ 0 ] + ( data[ 1 ] << 8 ) + ( data[ 2 ] << 16 ) + ( data[ 3 ] << 24 );

    	if ( id < 0 ) id = - 1;

    	this._currentPickingID = id;

    }
    /**
     * @param  {vec2} mouse mouse coordinate relative to thre canvas
     * @returns number the id of the picked object
     */
    pick( mouse: vec2 ): number {

    	this._drawPickingBuffer();
    	this._getPickedID( mouse );

    	this._fbo.unbind();

    	this._restoreShaders();

    	return this._currentPickingID;

    }

    /**
     * @param  {Node|Node[]} nodes nodes to check for picking
     */
    setNodes( nodes: Node | Node[] ) {

    	let id = 0;

    	const createPickingData = ( node: Node ) => {

    		node.traverse( ( childNode: Node ) => {

    			if ( childNode instanceof Batch ) {

    				id ++;

    				this._pickingDataArray.push( { batch: childNode, id, initialShader: childNode.shader } );

    			}


    		} );

    	};

    	if ( Array.isArray( nodes ) ) {

    		for ( let i = 0; i < nodes.length; i ++ ) {

    			const node = nodes[ i ];
    			createPickingData( node );

    		}

    	} else {

    		createPickingData( nodes );

    	}


    }

    resize( width: number, height: number ) {

    	this._fbo.resize( width, height );
    	this._rbo.resize( width, height );

    }
    /**
     * Draws the picking objects to a framebuffer
     * Assigns picking shader and passes ID as a uniform
     */
    _drawPickingBuffer() {

    	this._fbo.bind();

    	this._bolt.enableCullFace();
    	this._bolt.enableDepth();

    	this._bolt.setViewPort( 0, 0, this._canvas.width, this._canvas.height );
    	this._bolt.clear( 0, 0, 0, 1 );

    	for ( let i = 0; i < this._pickingDataArray.length; i ++ ) {

    		const pickingItem = this._pickingDataArray[ i ];

    		const { batch, id } = pickingItem;
    		batch.shader = this._pickingShader;
    		batch.shader.activate();

    		// adapted from https://webgl2fundamentals.org/webgl/lessons/webgl-picking.html
    		batch.shader.setVector4(
    			"id",
    			vec4.fromValues(
    				( ( id >> 0 ) & 0xFF ) / 0xFF,
    				( ( id >> 8 ) & 0xFF ) / 0xFF,
    				( ( id >> 16 ) & 0xFF ) / 0xFF,
    				( ( id >> 24 ) & 0xFF ) / 0xFF,
    			) );

    		this._bolt.draw( batch );

    	}


    }

    _restoreShaders() {

    	for ( let i = 0; i < this._pickingDataArray.length; i ++ ) {

    		const pickingItem = this._pickingDataArray[ i ];
    		const { batch, initialShader } = pickingItem;
    		batch.shader = initialShader;

    	}

    }

    public get currentPickingID(): number {

    	return this._currentPickingID;

    }
    public set currentPickingID( value: number ) {

    	this._currentPickingID = value;

    }

}
