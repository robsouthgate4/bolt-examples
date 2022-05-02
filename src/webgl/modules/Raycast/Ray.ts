import { Bounds } from "@bolt-webgl/core/lib/Mesh";
import { vec3 } from "gl-matrix";


export default class Ray {

    private _origin: vec3;
    private _direction: vec3;

    constructor( origin: vec3, direction: vec3 ) {

    	this._origin = origin;
    	this._direction = direction;

    }

    intersectsBox( bounds: Bounds ) {

    	const min = vec3.create();
    	const max = vec3.create();

    	vec3.sub( min, bounds.min, this._origin );
    	vec3.div( min, min, this._direction );

    	vec3.sub( max, bounds.max, this._origin );
    	vec3.div( max, max, this._direction );

    	const fmin = Math.max( Math.max( Math.min( min[ 0 ], max[ 0 ] ), Math.min( min[ 1 ], max[ 1 ] ) ), Math.min( min[ 2 ], max[ 2 ] ) );
    	const fmax = Math.min( Math.min( Math.max( min[ 0 ], max[ 0 ] ), Math.max( min[ 1 ], max[ 1 ] ) ), Math.max( min[ 2 ], max[ 2 ] ) );

    	return ( fmax >= fmin );

    }

    public get direction(): vec3 {

    	return this._direction;

    }

    public set direction( value: vec3 ) {

    	this._direction = value;

    }

    public get origin(): vec3 {

    	return this._origin;

    }

    public set origin( value: vec3 ) {

    	this._origin = value;

    }

}
