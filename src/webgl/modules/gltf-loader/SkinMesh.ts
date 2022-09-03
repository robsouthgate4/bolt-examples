import { Mesh, Node, Shader } from "@bolt-webgl/core";
import { GeometryBuffers, MeshParams } from "@bolt-webgl/core/build/Mesh";
import { mat4 } from "gl-matrix";
import Skin from "./Skin";

export default class SkinMesh extends Mesh {

	private _skin?: Skin | undefined;

	constructor( geometry?: GeometryBuffers, params?: MeshParams, ) {

		super( geometry, params );

		this.isSkinMesh = true;

	}

	draw( shader: Shader, node: Node ) {

		if ( ! this._skin || ! node ) return;

		this._skin.update( node! );

		// activate shader and pass joint data to shader
		shader.activate();
		shader.setTexture( "jointTexture", this._skin.jointTexture );

		this._skin.jointMatrices.forEach( ( jointMatrix, i ) => {

			shader.setMatrix4( `jointTransforms[${i}]`, jointMatrix );

		} );

		shader.setFloat( "jointCount", this._skin.joints.length );

		super.draw( shader );

	}

	public get skin(): Skin | undefined {

		return this._skin;

	}

	public set skin( value: Skin | undefined ) {

		this._skin = value;

	}

}
