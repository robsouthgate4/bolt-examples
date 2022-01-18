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
		this.orientation = vec3.fromValues( 0, 0, - 1 );

		this.increment = 0;

		vec3.add( this.position, this.position, this.orientation );

		this.resize();

	}

	resize( width, height ) {

		mat4.perspective( this.projection, this.fov, width / height, this.near, this.far );

	}

	matrix( elapsed, shader ) {

		const radius = 3;
		const camX = Math.sin( elapsed ) * radius;
		const camZ = Math.cos( elapsed ) * radius;

		mat4.lookAt( this.view, vec3.fromValues( camX, 1, camZ ), vec3.fromValues( 0, 0, 0 ), this.up );
		mat4.multiply( this.camera, this.projection, this.view );

		const uniformLocationView = this.gl.getUniformLocation( shader.program, "view" );
		this.gl.uniformMatrix4fv( uniformLocationView, false, this.view );

		const uniformLocationProjection = this.gl.getUniformLocation( shader.program, "projection" );
		this.gl.uniformMatrix4fv( uniformLocationProjection, false, this.projection );

		const uniformLocationCamera = this.gl.getUniformLocation( shader.program, "camera" );
		this.gl.uniformMatrix4fv( uniformLocationCamera, false, this.camera );

	}

}
