import { CLAMP_TO_EDGE, FLOAT, NEAREST, Node, RGBA, RGBA16F, RGBA32f, Texture } from "@bolt-webgl/core";

export default class Skin {

    private _joints: Node[];
    private _inverseBindMatrices: Float32Array[];
    private _jointMatrices: Float32Array[];
    private _jointData: Float32Array;
    private _jointTexture: Texture;

    constructor( joints: Node[], inverseBindMatrixData: Float32Array ) {

    	this._joints = joints;
    	this._inverseBindMatrices = [];
    	this._jointMatrices = [];

    	this._jointData = new Float32Array( this._joints.length * 16 );

    	for ( let i = 0; i < joints.length; i ++ ) {

    		this._inverseBindMatrices.push(
    			new Float32Array(
    				inverseBindMatrixData.buffer,
    				inverseBindMatrixData.byteOffset + Float32Array.BYTES_PER_ELEMENT * 16 * i * 16
    			)
    		);

    		this._jointMatrices.push(
    			new Float32Array( this._jointData.buffer, Float32Array.BYTES_PER_ELEMENT * 16 * i * 16 )
    		);

    	}

    	this._jointTexture = new Texture( {
    		format: RGBA,
    		internalFormat: RGBA32f,
    		wrapS: CLAMP_TO_EDGE,
    		wrapT: CLAMP_TO_EDGE,
    		minFilter: NEAREST,
    		magFilter: NEAREST,
    		type: FLOAT
    	} );

    }

}
