import { glMatrix, mat4, vec3 } from "gl-matrix";

export default class Transform {

	constructor() {

		this.position = vec3.fromValues( 0, 0, 0 );
		this.eulerRotation = vec3.fromValues( 0, 0, 0 );
		this.scale = vec3.fromValues( 1, 1, 1 );

	}

}
