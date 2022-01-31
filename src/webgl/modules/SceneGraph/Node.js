import { mat4 } from "gl-matrix";

export default class Node {

	constructor( { arrayBuffer } ) {

		this.localMatrix = mat4.create();
		this.modelMatrix = mat4.create();
		this.children = [];
		this.parent = null;
		this.arrayBuffer = arrayBuffer;

	}

	setParent( parent ) {

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

	updateModelMatrix( parentModelMatrix ) {

		if ( parentModelMatrix ) {

			mat4.multiply( this.modelMatrix, parentModelMatrix, this.localMatrix );

		} else {

			mat4.copy( this.modelMatrix, this.localMatrix );

		}

		const modelMatrix = this.modelMatrix;

		this.children.forEach( child => child.updateModelMatrix( modelMatrix ) );

	}

	updateMatrices( shader, camera ) {

		shader.activate();
		shader.setMatrix4( "view", camera.getViewMatrix() );
		shader.setMatrix4( "projection", camera.getProjectionMatrix() );
		shader.setMatrix4( "model", this.modelMatrix );

	}

	drawTriangles( shader, camera ) {

		this.updateMatrices( shader, camera );

		this.arrayBuffer.drawTriangles( shader );

	}

	drawLines( shader, camera ) {

		this.updateMatrices( shader, camera );

		this.arrayBuffer.drawLines( shader );

	}

	drawPoints( shader, camera ) {

		this.updateMatrices( shader, camera );

		this.arrayBuffer.drawPoints( shader );

	}

}
