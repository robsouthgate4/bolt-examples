import ArrayBuffer from "@/webgl/core/ArrayBuffer";
import ArrayBufferInterleaved from "@/webgl/core/ArrayBufferInterleaved";
import Camera from "@/webgl/core/Camera";
import Shader from "@/webgl/core/Shader";
import { mat4 } from "gl-matrix";
import Transform from "./Transform";

export default class Node {

    localMatrix: mat4;
    modelMatrix: mat4;
    children: Node[];
    parent: Node | null;
    arrayBuffer?: ArrayBuffer | ArrayBufferInterleaved;
    transform: Transform;
    autoUpdate: boolean;

    constructor( arrayBuffer?: ArrayBuffer | ArrayBufferInterleaved ) {

    	this.localMatrix = mat4.create();
    	this.modelMatrix = mat4.create();
    	this.children = [];
    	this.parent = null;
    	this.arrayBuffer = arrayBuffer;
    	this.transform = new Transform();

    	this.autoUpdate = true;

    }

    setParent( parent: Node ) {

    	if ( this.parent ) {

    		const index = this.parent.children.indexOf( this );

    		if ( index >= 0 ) {

    			this.parent.children.slice( index, 1 );

    		}

    	}

    	if ( parent ) {

    		parent.children.push( this );

    	}

    	this.parent = parent;

    }

    setDrawType( value: number ) {

    	if ( ! this.arrayBuffer ) return;

    	this.arrayBuffer.setDrawType( value );

    }

    updateModelMatrix( parentModelMatrix?: mat4 ) {

    	const transform = this.transform;
    	if ( transform ) {

    		transform.getMatrix( this.localMatrix );

    	}

    	if ( parentModelMatrix ) {

    		mat4.multiply( this.modelMatrix, parentModelMatrix, this.localMatrix );

    	} else {

    		mat4.copy( this.modelMatrix, this.localMatrix );

    	}

    	const modelMatrix = this.modelMatrix;

    	this.children.forEach( child => child.updateModelMatrix( modelMatrix ) );

    }

    updateMatrices( shader: Shader, camera: Camera ) {

    	shader.activate();
    	shader.setMatrix4( "view", camera.getViewMatrix() );
    	shader.setMatrix4( "projection", camera.getProjectionMatrix() );
    	shader.setMatrix4( "model", this.modelMatrix );

    	if ( this.autoUpdate ) {

    		this.updateModelMatrix();

    	}

    }

    drawTriangles( shader: Shader, camera: Camera ) {

    	this.updateMatrices( shader, camera );
    	if ( ! this.arrayBuffer ) return;
    	this.arrayBuffer.drawTriangles( shader );

    }

    drawLines( shader: Shader, camera: Camera ) {

    	this.updateMatrices( shader, camera );
    	if ( ! this.arrayBuffer ) return;
    	this.arrayBuffer.drawLines( shader );

    }

    drawPoints( shader: Shader, camera: Camera ) {

    	this.updateMatrices( shader, camera );
    	if ( ! this.arrayBuffer ) return;
    	this.arrayBuffer.drawPoints( shader );

    }

}
