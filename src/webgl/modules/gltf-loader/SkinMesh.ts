import { Mesh, Shader } from "@bolt-webgl/core";
import { GeometryBuffers, MeshParams } from "@bolt-webgl/core/build/Mesh";
import Skin from "./Skin";

export default class SkinMesh extends Mesh {

    _skin!: Skin;

    constructor( skin: Skin, geometry?: GeometryBuffers, params?: MeshParams, ) {

    	super( geometry, params );

    	this._skin = skin;

    }

    draw( shader: Shader ) {

    	super.draw( shader );

    }

}
