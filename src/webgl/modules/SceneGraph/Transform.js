import { glMatrix, mat4, vec3 } from "gl-matrix";

export default class Transform {

	constructor() {

		this.position = vec3.fromValues( 0, 0, 0 );
		this.eulerRotation = vec3.fromValues( 0, 0, 0 );
		this.scale = vec3.fromValues( 1, 1, 1 );

		this.modelMatrix = mat4.create();
		mat4.identity( this.modelMatrix );

	}

	getLocalModelMatrix() {

		const transformX = mat4.create();
		const transformY = mat4.create();
		const transformZ = mat4.create();

		const rotationMatrix = mat4.create();

		mat4.rotate( transformX, transformX, glMatrix.toRadian( this.eulerRotation.x ), vec3.fromValues( 1, 0, 0 ) );
		mat4.rotate( transformY, transformY, glMatrix.toRadian( this.eulerRotation.y ), vec3.fromValues( 0, 1, 0 ) );
		mat4.rotate( transformZ, transformZ, glMatrix.toRadian( this.eulerRotation.z ), vec3.fromValues( 0, 0, 1 ) );

		mat4.multiply( rotationMatrix, transformY, transformX );
		mat4.multiply( rotationMatrix, rotationMatrix, transformZ );


		const outMatrix = mat4.create();
		mat4.translate( outMatrix, mat4.create(), this.position );
		mat4.multiply( outMatrix, outMatrix, rotationMatrix );
		mat4.scale( outMatrix, mat4.create(), this.scale );

	}

}
