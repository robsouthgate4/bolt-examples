import { Camera } from "@bolt-webgl/core";
import { Viewport } from "@bolt-webgl/core/lib/Bolt";
import { mat4, vec3, vec4 } from "gl-matrix";

export default class Raycast {

    private _camera: Camera;
    private _inverseProjection = mat4.create();
    private _inverseView = mat4.create();

    constructor( camera: Camera ) {

    	this._camera = camera;

    }

    unproject( { x, y, viewport }: { x: number, y: number, viewport: Viewport } ): vec3 {

    	mat4.invert( this._inverseProjection, this._camera.projection );
    	mat4.invert( this._inverseView, this._camera.view );

    	const { offsetX, offsetY, width, height } = viewport;

    	const out = vec4.fromValues(
    		( 2 * x ) / width - 1 - offsetX,
    		( 2 * ( height - y - 1 ) ) / height - 1,
    		1,
    		1,
    	);

    	vec4.transformMat4( out, out, this._inverseProjection );
    	out[ 3 ] = 0;

    	vec4.transformMat4( out, out, this._inverseView );

    	vec4.normalize( out, out );

    	return vec3.fromValues( out[ 0 ], out[ 1 ], out[ 2 ] );

    }

}
