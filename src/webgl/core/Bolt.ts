/*
This will be our renderer
*/

import ArrayBuffer from "./ArrayBuffer";

interface BoltParams {
  antialias?: boolean
}

export default class Bolt {

  private static _instance: Bolt;
  gl!: WebGL2RenderingContext;

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

  enableDepth() {

  	this.gl.enable( this.gl.DEPTH_TEST );

  }

  disableDepth() {

  	this.gl?.disable( this.gl.DEPTH_TEST );

  }

  draw( drawable: ArrayBuffer ) {

  	return;

  }

}
