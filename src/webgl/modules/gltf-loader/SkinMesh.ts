import { Mesh, Node, Shader } from "@bolt-webgl/core";
import { GeometryBuffers, MeshParams } from "@bolt-webgl/core/build/Mesh";
import Skin from "./Skin";

export default class SkinMesh extends Mesh {

    _skin!: Skin;

    constructor( skin: Skin, geometry?: GeometryBuffers, params?: MeshParams, ) {

    	super( geometry, params );

    	this._skin = skin;

    }

    draw( shader: Shader, node?: Node ) {

    	this._skin.update( node! );

    	// activate shader and pass joint data to shader
    	shader.activate();
    	shader.setTexture( "jointsTexture", this._skin.jointTexture );
    	shader.setInt( "jointsCount", this._skin.joints.length );


    	super.draw( shader );

    }

}
