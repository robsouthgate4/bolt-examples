import { Camera } from "@bolt-webgl/core";
import { Viewport } from "@bolt-webgl/core/lib/Bolt";
import { mat4, vec3 } from "gl-matrix";

export default class Raycast {

    private _camera: Camera;

    constructor( camera: Camera ) {

    	this._camera = camera;

    }

}
