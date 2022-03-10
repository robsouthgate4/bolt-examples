
import { Pass } from "./passes/Pass";
import RenderPass from "./passes/RenderPass";

export default class Post {

  gl: WebGL2RenderingContext;
  _height: number;
  _width: number;
  _passes: Pass[] = [];

  constructor( gl: WebGL2RenderingContext ) {

  	this.gl = gl;

  	this._width = window.innerWidth;
  	this._height = window.innerHeight;

  	this._passes = [];

  }

  add( pass: Pass, renderToScreen = false ) {

  	pass.renderToScreen = renderToScreen;
  	this._passes.push( pass );

  }

  resize( width: number, height: number ) {

  	return;

  }

  begin() {

  	this._passes.forEach( ( pass: Pass ) => {

  		if ( pass instanceof RenderPass ) {

  			pass.fbo.bind();

  			if ( pass.renderToScreen ) {

  				pass.fbo.unbind();

  			}

  		}

  	} );

  	this.gl.enable( this.gl.DEPTH_TEST );


  }

  end() {

  	this.gl.disable( this.gl.DEPTH_TEST );


  	this._passes.forEach( ( pass: Pass, index: number ) => {

  		if ( pass instanceof RenderPass ) {

  			pass.fbo.unbind();

  		} else {

  			pass.draw( this._passes[ index - 1 ].fbo, pass.renderToScreen );

  		}

  	} );

  }

}
