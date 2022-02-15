import { mat4, vec3 } from "gl-matrix";
import VAO from "./VAO";
import VBO from "./VBO";
import IBO from "./IBO";
import Shader from "./Shader";
import VBOInstanced from "./VBOInstanced";

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
	instanceMatrices?: mat4[];
	instanceCount?: number;

	constructor(
		gl: WebGL2RenderingContext,
		positions: number[] | Float32Array,
		normals: number[]| Float32Array,
		uvs: number[]| Float32Array,
		params?: ArrayBufferParams
	) {

		this.gl = gl;
		this.positions = positions;
		this.normals = normals;
		this.uvs = uvs;

		console.log(params)

		this.indices = params?.indices;
		this.instanced = params?.instanced;
		this.instanceMatrices = params?.instanceMatrices;
		this.instanceCount = params?.instanceCount;

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
		this.vao.linkAttrib( normalVbo, 1, 3, this.gl.FLOAT, 3 * 4, 0 * 4 );
		this.vao.linkAttrib( uvVbo, 2, 2, this.gl.FLOAT, 2 * 4, 0 * 4 );

		if ( this.instanced && this.instanceMatrices ) {

			const instancedVBO = new VBOInstanced( this.instanceMatrices, this.gl );
			instancedVBO.bind();

			console.log(instancedVBO)

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
		positionVbo.unbind();
		normalVbo.unbind();
		uvVbo.unbind();

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

			if ( this.instanced && this.instanceCount ) {

				this.gl.drawElementsInstanced( this.gl.TRIANGLES, this.indices.length, this.gl.UNSIGNED_SHORT, 0, this.instanceCount  )

			} else {

				this.gl.drawElements( this.gl.TRIANGLES, this.indices.length, this.gl.UNSIGNED_SHORT, 0 );

			}

			this.ibo.unbind();

		} else {

			if ( this.instanced && this.instanceCount ) {

				this.gl.drawArraysInstanced( this.gl.TRIANGLES, 0, this.positions.length / 3, this.instanceCount );

			} else {

				this.gl.drawArrays( this.gl.TRIANGLES, 0, this.positions.length / 3 );

			}

		}

		this.vao.unbind();

	}

}
