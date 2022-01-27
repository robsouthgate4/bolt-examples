import { vec3 } from "gl-matrix";
import VAO from "./VAO";
import VBO from "./VBO";

export default class GLNode {

	constructor( {
		vertices = [],
		indices = [],
		positions = [],
		normals = [],
		uvs = [],
		textures = [],
		stride = 3,
		gl
	} ) {

		this.gl = gl;

		this.stride = stride;

		this.vertices = vertices;

		this.positions = positions;
		this.indices = indices;
		this.normals = normals;
		this.uvs = uvs;
		this.textures = textures;

		this.vao = new VAO( { gl: this.gl } );

		// assume the positions, normals and vertices are interleaved
		if ( this.vertices.length > 0 ) {

			this.handleInterleaved();

		} else {

			this.handleBuffers();

		}

	}

	handleBuffers() {

		const positionVbo = new VBO( { data: this.positions, gl: this.gl } );
		const normalVbo = new VBO( { data: this.normals, gl: this.gl } );
		const uvVbo = new VBO( { data: this.uvs, gl: this.gl } );

		this.vao.bind();
		// link positions
		this.vao.linkAttrib( { vbo: positionVbo, layoutID: 0, numComponents: 3, type: this.gl.FLOAT, stride: 3 * 4, offset: 0 * 4 } );
		// link normals
		this.vao.linkAttrib( { vbo: normalVbo, layoutID: 1, numComponents: 3, type: this.gl.FLOAT, stride: 3 * 4, offset: 0 * 4 } );
		// link uvs
		this.vao.linkAttrib( { vbo: uvVbo, layoutID: 2, numComponents: 2, type: this.gl.FLOAT, stride: 2 * 4, offset: 0 * 4 } );

		this.vao.unbind();
		positionVbo.unbind();
		normalVbo.unbind();
		uvVbo.unbind();

	}

	handleInterleaved() {

		const vbo = new VBO( { data: this.vertices, gl: this.gl } );

		this.vao.bind();
		// link positions
		this.vao.linkAttrib( { vbo, layoutID: 0, numComponents: 3, type: this.gl.FLOAT, stride: this.stride * 4, offset: 0 * 4 } );
		// link normals
		this.vao.linkAttrib( { vbo, layoutID: 1, numComponents: 3, type: this.gl.FLOAT, stride: this.stride * 4, offset: 3 * 4 } );
		// link uvs
		//this.vao.linkAttrib( { vbo, layoutID: 2, numComponents: 2, type: this.gl.FLOAT, stride: this.stride * 4, offset: 6 * 4 } ); // TODO: create way to detect data provided

		this.vao.unbind();
		vbo.unbind();

	}

	calculateTangents( vs, tc, ind ) {

		const tangents = [];

		for ( let i = 0; i < vs.length / 3; i ++ ) {

			tangents[ i ] = [ 0, 0, 0 ];

		}

		let
			a = [ 0, 0, 0 ],
			b = [ 0, 0, 0 ],
			triTangent = [ 0, 0, 0 ];

		for ( let i = 0; i < ind.length; i += 3 ) {

			const i0 = ind[ i ];
			const i1 = ind[ i + 1 ];
			const i2 = ind[ i + 2 ];

			const pos0 = [ vs[ i0 * 3 ], vs[ i0 * 3 + 1 ], vs[ i0 * 3 + 2 ] ];
			const pos1 = [ vs[ i1 * 3 ], vs[ i1 * 3 + 1 ], vs[ i1 * 3 + 2 ] ];
			const pos2 = [ vs[ i2 * 3 ], vs[ i2 * 3 + 1 ], vs[ i2 * 3 + 2 ] ];

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
		const ts = [];
		tangents.forEach( tan => {

			vec3.normalize( tan, tan );
			ts.push( tan[ 0 ] );
			ts.push( tan[ 1 ] );
			ts.push( tan[ 2 ] );

		} );

		return ts;

	}

	draw() {

		this.vao.bind();
		if ( this.vertices.length > 0 ) {

			this.gl.drawArrays( this.gl.TRIANGLES, 0, this.vertices.length / this.stride );

		} else {

			this.gl.drawArrays( this.gl.TRIANGLES, 0, this.positions.length / this.stride );

		}

	}

}
