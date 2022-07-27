import { Batch, LINES, Mesh, Shader } from "@bolt-webgl/core";

import vertexShader from "./shaders/axis.vert";
import fragmentShader from "./shaders/axis.frag";
import { vec3 } from "gl-matrix";

export default class Axis extends Batch {

	constructor() {

		const mesh = new Mesh( {
			positions: [
				- 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, //x
				0.0, - 1.0, 0.0, 0.0, 1.0, 0.0, //y
				0.0, 0.0, - 1.0, 0.0, 0.0, 1.0, //z
			]
		} ).setDrawType( LINES );

		const colors = [
			1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
			0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
			0.0, 0.0, 1.0, 0.0, 0.0, 1.0
		];

		mesh.addAttribute( new Float32Array( colors ), 3, 3 );

		const shader = new Shader( vertexShader, fragmentShader );

		super( mesh, shader );

		this.transform.scale = vec3.fromValues( 5, 5, 5 );

	}

}
