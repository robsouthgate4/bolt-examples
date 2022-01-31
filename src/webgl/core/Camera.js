import { mat4, vec3 } from "gl-matrix";

export default class Camera {

	constructor( {
		width,
		height,
		position,
		gl,
		fov,
		near,
		far
	} ) {

		this.gl = gl;
		this.fov = fov;
		this.near = near;
		this.far = far;
		this.width = width,
		this.height = height;
		this.position = position;

		this.view = mat4.create();
		this.projection = mat4.create();
		this.camera = mat4.create();
		this.up = vec3.fromValues( 0, 1, 0 );
		this.forward = vec3.fromValues( 0, 0, - 1 );

		this.vector = vec3.create();
		this.active = false;

		this.target = vec3.create();
		vec3.add( this.target, this.position, this.forward );

		this.resize();

	}

	resize( width, height ) {

		mat4.perspective( this.projection, this.fov, width / height, this.near, this.far );

	}

	getPosition() {

		return this.position;

	}

	getViewMatrix() {

		return this.view;

	}

	getProjectionMatrix() {

		return this.projection;

	}

	update( elapsed, delta ) {

		mat4.lookAt( this.view, this.position, this.target, this.up );
		mat4.multiply( this.camera, this.projection, this.view );

	}

}
