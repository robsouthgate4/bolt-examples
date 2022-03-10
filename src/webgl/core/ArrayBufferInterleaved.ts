import { mat4 } from "gl-matrix";
import VAO from "./VAO";
import VBO from "./VBO";
import IBO from "./IBO";
import Shader from "./Shader";
import { ArrayBufferParams } from "./ArrayBuffer";
import VBOInstanced from "./VBOInstanced";
import Bolt from "./Bolt";

export default class ArrayBufferInterleaved {

	gl: WebGL2RenderingContext;
	stride: number;
	buffer: number[] | Float32Array;
	indices?: number[] | Uint16Array;
	instanced?: boolean;
	instanceCount?: number;
	instanceMatrices?: mat4[];
	vao: VAO;
	ibo!: IBO;

	constructor(
		stride: number,
		buffer: number[] | Float32Array,
		params?: ArrayBufferParams
	) {

  	this.gl = Bolt.getInstance().gl;
  	this.stride = stride || 3;
  	this.buffer = buffer;

  	this.indices = params?.indices;
  	this.instanced = params?.instanced;
  	this.instanceMatrices = params?.instanceMatrices;
  	this.instanceCount = params?.instanceCount;

  	this.vao = new VAO();

  	// assume the positions, normals and vertices are interleaved
  	this.linkBuffers();

	}

	linkBuffers() {

  	const vbo = new VBO( this.buffer );

  	this.vao.bind();
  	this.vao.linkAttrib( vbo, 0, 3, this.gl.FLOAT, this.stride * 4, 0 );
  	this.vao.linkAttrib( vbo, 1, 3, this.gl.FLOAT, this.stride * 4, 3 * 4 );
  	this.vao.linkAttrib( vbo, 2, 3, this.gl.FLOAT, this.stride * 4, 6 * 4 );

  	if ( this.instanced && this.instanceMatrices ) {

  		const instancedVBO = new VBOInstanced( this.instanceMatrices );
  		instancedVBO.bind();

  		const bytesMatrix = 4 * 16;
  		const bytesVec4 = 4 * 4;

  		this.vao.linkAttrib( instancedVBO, 3, 4, this.gl.FLOAT, bytesMatrix, 0 * bytesVec4 );
  		this.vao.linkAttrib( instancedVBO, 4, 4, this.gl.FLOAT, bytesMatrix, 1 * bytesVec4 );
  		this.vao.linkAttrib( instancedVBO, 5, 4, this.gl.FLOAT, bytesMatrix, 2 * bytesVec4 );
  		this.vao.linkAttrib( instancedVBO, 6, 4, this.gl.FLOAT, bytesMatrix, 3 * bytesVec4 );

  		this.gl.vertexAttribDivisor( 3, 1 );
  		this.gl.vertexAttribDivisor( 4, 1 );
  		this.gl.vertexAttribDivisor( 5, 1 );
  		this.gl.vertexAttribDivisor( 6, 1 );

  		instancedVBO.unbind();

  	}

  	this.vao.unbind();
  	vbo.unbind();

	}

	addAttribute( buffer: Float32Array | number[], size: number, layoutID: number ) {

		const vbo = new VBO( buffer || [] );

		this.vao.bind();
		this.vao.linkAttrib( vbo, layoutID, size, this.gl.FLOAT, 0 * Float32Array.BYTES_PER_ELEMENT, 0 * Float32Array.BYTES_PER_ELEMENT );
		this.vao.unbind();

	}

	addInstancedAttribute( buffer: Float32Array | number[], size: number, layoutID: number ) {

		const vbo = new VBO( buffer || [] );

		this.vao.bind();
		this.vao.linkAttrib( vbo, layoutID, size, this.gl.FLOAT, 0 * Float32Array.BYTES_PER_ELEMENT, 0 * Float32Array.BYTES_PER_ELEMENT );
		this.gl.vertexAttribDivisor( 3, 1 );
		this.vao.unbind();

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

  			if ( this.instanced && this.instanceCount ) {

  				//onsole.log( this.instanceCount );

  				this.gl.drawArraysInstanced( this.gl.TRIANGLES, 0, this.buffer.length / this.stride, this.instanceCount );

  			} else {

  				this.gl.drawArrays( this.gl.TRIANGLES, 0, this.buffer.length / this.stride );

  			}


  		}

  	}

  	this.vao.unbind();

	}

}
