import { mat4, vec3 } from "gl-matrix";
import VAO from "./VAO";
import VBO from "./VBO";
import IBO from "./IBO";
import Shader from "./Shader";

export interface ArrayBufferParams {
  indices?: number[] | Uint16Array;
  instanced?: boolean;
  instanceCount?: number;
  instanceMatrices?: mat4[];
}

export default class ArrayBuffer {

  gl: WebGL2RenderingContext;
  positions: number[] | Float32Array;
  normals: number[]| Float32Array;
  uvs?: number[]| Float32Array;
  indices?: number[] | Uint16Array;
  instanced?: boolean;
  vao: VAO;
  ibo!: IBO;

  constructor(
  	gl: WebGL2RenderingContext,
  	positions: number[] | Float32Array,
  	normals: number[]| Float32Array,
  	uvs: number[]| Float32Array,
  	params: ArrayBufferParams

  ) {

  	this.gl = gl;
  	this.positions = positions;
  	this.normals = normals;
  	this.uvs = uvs;

  	this.indices = params.indices;
  	this.instanced = params.instanced;

  	this.vao = new VAO( gl );

  	this.linkBuffers();

  	if ( this.indices && this.indices.length > 0 ) {

  		this.ibo = new IBO( this.indices, gl );

  	}

  }

  linkBuffers() {

  	const positionVbo = new VBO( this.positions || [], this.gl );
  	const normalVbo = new VBO( this.normals || [], this.gl );
  	const uvVbo = new VBO( this.uvs || [], this.gl );

  	this.vao.bind();
  	// link positions
  	this.vao.linkAttrib( positionVbo, 0, 3, this.gl.FLOAT, 3 * 4, 0 * 4 );
  	// link normals
  	this.vao.linkAttrib( normalVbo, 1, 3, this.gl.FLOAT, 3 * 4, 0 * 4 );
  	// link uvs
  	this.vao.linkAttrib( uvVbo, 2, 2, this.gl.FLOAT, 2 * 4, 0 * 4 );

  	this.vao.unbind();
  	positionVbo.unbind();
  	normalVbo.unbind();
  	uvVbo.unbind();

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

  	if ( shader.textures && shader.textures.length > 0 ) {

  		for ( let i = 0; i < shader.textures.length; i ++ ) {

  			const textureObject = shader.textures[ i ];

  			textureObject.texture.textureUnit( shader, textureObject.uniformName, i );
  			textureObject.texture.bind();

  		}

  	}

  }

  drawPoints( shader: Shader ) {

  	this.bindTextures( shader );

  	this.vao.bind();
  	this.gl.drawArrays( this.gl.POINTS, 0, this.positions.length / 3 );
  	this.vao.unbind();

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

  		this.gl.drawElements( this.gl.TRIANGLES, this.indices.length, this.gl.UNSIGNED_SHORT, 0 * 4 );

  		this.ibo.unbind();

  	} else {

  		this.gl.drawArrays( this.gl.TRIANGLES, 0, this.positions.length / 3 );

  	}

  	this.vao.unbind();

  }

}
