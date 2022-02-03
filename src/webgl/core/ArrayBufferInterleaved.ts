import { vec3 } from "gl-matrix";
import VAO from "./VAO";
import VBO from "./VBO";
import IBO from "./IBO";
import Texture from "./Texture";
import Shader from "./Shader";

export default class ArrayBufferInterleaved {

  gl: WebGL2RenderingContext;
  stride: number;
  buffer?: number[] | Float32Array;
  indices?: number[] | Float32Array;
  textures?: Texture[];
  vao: VAO;
  ibo!: IBO;

  constructor(
  	gl: WebGL2RenderingContext,
  	stride: number,
  	buffer?: number[] | Float32Array,
  	indices?: number[] | Float32Array,
  	textures?: Texture[]
  ) {

  	this.gl = gl;
  	this.stride = stride || 3;
  	this.buffer = buffer;
  	this.textures = textures;
  	this.indices = indices;

  	this.vao = new VAO( gl );

  	// assume the positions, normals and vertices are interleaved
  	this.linkBuffers();

  }

  linkBuffers() {

  	const vbo = new VBO( this.buffer || [], this.gl );

  	this.vao.bind();
  	this.vao.linkAttrib( vbo, 0, 3, this.gl.FLOAT, this.stride * 4, 0 );
  	this.vao.linkAttrib( vbo, 1, 3, this.gl.FLOAT, this.stride * 4, 3 * 4 );
  	this.vao.linkAttrib( vbo, 2, 3, this.gl.FLOAT, this.stride * 4, 6 * 4 );

  	this.vao.unbind();
  	vbo.unbind();

  }

  calculateTangents( vs: number[], tc: number[], ind: number[] ) : number[] {

  	const tangents = [] as vec3[];

  	for ( let i = 0; i < vs.length / 3; i ++ ) {

  		tangents[ i ] = [ 0, 0, 0 ];

  	}

  	let
  		a = [ 0, 0, 0 ] as vec3,
  		b = [ 0, 0, 0 ] as vec3,
  		triTangent = [ 0, 0, 0 ] as vec3;

  	for ( let i = 0; i < ind.length; i += 3 ) {

  		const i0 = ind[ i ];
  		const i1 = ind[ i + 1 ];
  		const i2 = ind[ i + 2 ];

  		const pos0 = <vec3>( [ vs[ i0 * 3 ], vs[ i0 * 3 + 1 ], vs[ i0 * 3 + 2 ] ] );
  		const pos1 = <vec3>( [ vs[ i1 * 3 ], vs[ i1 * 3 + 1 ], vs[ i1 * 3 + 2 ] ] );
  		const pos2 = <vec3>( [ vs[ i2 * 3 ], vs[ i2 * 3 + 1 ], vs[ i2 * 3 + 2 ] ] );

  		const tex0 = [ tc[ i0 * 2 ], tc[ i0 * 2 + 1 ] ];
  		const tex1 = [ tc[ i1 * 2 ], tc[ i1 * 2 + 1 ] ];
  		const tex2 = [ tc[ i2 * 2 ], tc[ i2 * 2 + 1 ] ];

  		vec3.subtract( a, pos1, pos0 );
  		vec3.subtract( b, pos2, pos0 );

  		const c2c1b = tex1[ 1 ] - tex0[ 1 ];
  		const c3c1b = tex2[ 0 ] - tex0[ 1 ];

  		triTangent = [ c3c1b * a[ 0 ] - c2c1b * b[ 0 ], c3c1b * a[ 1 ] - c2c1b * b[ 1 ], c3c1b * a[ 2 ] - c2c1b * b[ 2 ] ];

  		vec3.add( triTangent, tangents[ i0 ], triTangent );
  		vec3.add( triTangent, tangents[ i1 ], triTangent );
  		vec3.add( triTangent, tangents[ i2 ], triTangent );

  	}

  	// Normalize tangents
  	const ts: number[] = [];
  	tangents.forEach( ( tan: vec3 ) => {

  		vec3.normalize( tan, tan );
  		ts.push( tan[ 0 ] );
  		ts.push( tan[ 1 ] );
  		ts.push( tan[ 2 ] );

  	} );

  	return ts;

  }

  bindTextures( shader: Shader ) {

  	if ( ! shader ) return;

  	if ( this.textures && this.textures.length > 0 ) {

  		for ( let i = 0; i < this.textures.length; i ++ ) {

  			const texture = this.textures[ i ];

  			texture.textureUnit( shader, `map${i}`, i );
  			texture.bind();

  		}

  	}

  }

  drawPoints( shader: Shader ) {

  	this.bindTextures( shader );

  	if ( this.buffer ) {

  		this.vao.bind();
  		this.gl.drawArrays( this.gl.POINTS, 0, this.buffer.length / this.stride );
  		this.vao.unbind();

  	}

  }

  drawLines( shader: Shader ) {

  	this.bindTextures( shader );

  	if ( this.indices && this.indices.length ) {

  		this.vao.bind();
  		this.ibo.bind();
  		this.gl.drawElements( this.gl.LINE_STRIP, this.indices.length, this.gl.UNSIGNED_SHORT, 0 * 4 );
  		this.vao.unbind();

  	}

  }

  drawTriangles( shader: Shader ) {

  	this.bindTextures( shader );

  	this.vao.bind();

  	if ( this.indices && this.indices.length > 0 ) {

  		this.ibo.bind();

  		this.gl.drawElements( this.gl.TRIANGLES, this.indices.length, this.gl.UNSIGNED_SHORT, 0 );

  		this.ibo.unbind();

  	} else {

  		if ( this.buffer && this.buffer.length > 0 ) {

  			// draw interleaved

  			this.gl.drawArrays( this.gl.TRIANGLES, 0, this.buffer.length / this.stride );

  		}

  	}

  	this.vao.unbind();

  }

}
