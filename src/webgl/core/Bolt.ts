/*
This will be our renderer
*/

import ArrayBuffer from "./ArrayBuffer";
import Camera from "./Camera";
import Node from "./Node";
import Shader from "./Shader";

interface BoltParams {
  antialias?: boolean
}

export default class Bolt {

  private static _instance: Bolt;
  gl!: WebGL2RenderingContext;
  private _camera!: Camera;

  static getInstance(): Bolt {

  	if ( ! Bolt._instance ) Bolt._instance = new this( );
  	return Bolt._instance;

  }

  init( canvas: HTMLCanvasElement, { antialias }: BoltParams ) {

  	this.gl = <WebGL2RenderingContext> canvas.getContext( "webgl2", { antialias: antialias || false } );

  }

  clear( r: number, g: number, b: number, a: number ) {

  	this.gl.clearColor( r, g, b, a );
  	this.gl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT );

  }

  setViewPort( x: number, y: number, width: number, height: number ) {

  	this.gl.viewport( x, y, width, height );

  }

  setCamera( camera: Camera ) {

  	this._camera = camera;

  }

  enableDepth() {

  	this.gl.enable( this.gl.DEPTH_TEST );

  }

  disableDepth() {

  	this.gl.disable( this.gl.DEPTH_TEST );

  }

  getContext() {

  	return this.gl;

  }

  draw( shader: Shader, drawables: ArrayBuffer[] | Node[] ) {

  	let drawType: number;

  	drawables.forEach( ( drawable: Node | ArrayBuffer ) => {

  		if ( drawable instanceof Node ) {

  			if ( drawable.arrayBuffer ) {

  				drawType = drawable.arrayBuffer.drawType;

  			}


  		} else {

  			drawType = drawable.drawType;

  		}

  		if ( drawType ) {

  			if ( drawType === this.gl.POINTS ) {

  				drawable.drawPoints( shader, this._camera );

  			} else if ( drawType === this.gl.LINES ) {

  				drawable.drawLines( shader, this._camera );

  			} else if ( drawType === this.gl.TRIANGLES ) {

  				drawable.drawTriangles( shader, this._camera );

  			}

  		} else {

  			drawable.drawTriangles( shader, this._camera );

  		}



  	} );

  }

}
