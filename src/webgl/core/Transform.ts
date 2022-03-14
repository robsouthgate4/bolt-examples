import { mat4, vec3, quat } from "gl-matrix";

export default class Transform {

    position: vec3;
    rotation: vec3;
    scale: vec3;

    constructor() {

    	this.position = vec3.fromValues( 0, 0, 0 );
    	this.rotation = vec3.fromValues( 0, 0, 0 );
    	this.scale = vec3.fromValues( 1, 1, 1 );

    }

    getMatrix( localMatrix: mat4 ) {

    	const t = this.position;
    	const r = this.rotation;
    	const s = this.scale;

    	const q = quat.create();

    	mat4.fromRotationTranslationScale( localMatrix, q, t, s );

    	mat4.translate( localMatrix, localMatrix, t );
    	mat4.rotateX( localMatrix, localMatrix, r[ 0 ] );
    	mat4.rotateY( localMatrix, localMatrix, r[ 1 ] );
    	mat4.rotateZ( localMatrix, localMatrix, r[ 2 ] );
    	mat4.scale( localMatrix, localMatrix, s );

    	return localMatrix;

    }

}
