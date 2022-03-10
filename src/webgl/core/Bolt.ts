/*
This will be our renderer
*/

import ArrayBuffer from "./ArrayBuffer";

export default class Bolt {

  private static _instance: Bolt;

  static getInstance(): Bolt {

  	if ( ! Bolt._instance ) Bolt._instance = new this();
  	return Bolt._instance;

  }

  draw( drawable: ArrayBuffer ) {

  	return;

  }

}
