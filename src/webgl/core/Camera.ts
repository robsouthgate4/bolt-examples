import { mat4, vec3 } from "gl-matrix";
import Bolt from "./Bolt";

export default class Camera {

  fov: number;
  near: number;
  far: number;
  width: number;
  height: number;
  position: vec3;
  view: mat4;
  projection: mat4;
  camera: mat4;
  up: vec3;
  forward: vec3;
  vector: vec3;
  active: boolean;
  target = vec3.fromValues( 0, 0, 0 );

  constructor(
  	width: number,
  	height: number,
  	position: vec3,
  	fov: number,
  	near: number,
  	far: number
  ) {

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

  	this.resize( width, height );

  }

  resize( width: number, height: number ) {

  	mat4.perspective( this.projection, this.fov, width / height, this.near, this.far );

  }

  lookAt( target: vec3 ) {

  	vec3.copy( this.target, target );

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

  update() {

  	mat4.lookAt( this.view, this.position, this.target, this.up );
  	mat4.multiply( this.camera, this.projection, this.view );

  }

}
