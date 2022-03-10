import { mat3, mat4, vec2, vec3, vec4 } from "gl-matrix";
import Texture from "./Texture";
import Bolt from "./Bolt";

interface TextureObject {
  uniformName: string;
  texture: Texture
}

export default class Shader {

  gl: WebGL2RenderingContext;
  vertexShader: WebGLShader;
  fragmentShader: WebGLShader;
  program: WebGLProgram;
  textureUnit: number;
  textures: TextureObject[];

  constructor(
  	vertexShaderSrc: string,
  	fragmentShaderSrc: string,
  	parameters?: {
      transformFeedbackVaryings: string[]
    }
  ) {

  	this.textureUnit = 0;
  	this.textures = <TextureObject[]>[];

  	this.gl = Bolt.getInstance().gl;

  	this.vertexShader = <WebGLShader>(
      this.gl.createShader( this.gl.VERTEX_SHADER )
    );

  	this.gl.shaderSource( this.vertexShader, vertexShaderSrc );
  	this.gl.compileShader( this.vertexShader );
  	const vertexLogs = this.gl.getShaderInfoLog( this.vertexShader );

  	if ( vertexLogs && vertexLogs.length > 0 ) {

  		throw vertexLogs;

  	}

  	this.fragmentShader = <WebGLShader>(
      this.gl.createShader( this.gl.FRAGMENT_SHADER )
    );

  	this.gl.shaderSource( this.fragmentShader, fragmentShaderSrc );
  	this.gl.compileShader( this.fragmentShader );

  	const fragmentLogs = this.gl.getShaderInfoLog( this.fragmentShader );

  	if ( fragmentLogs && fragmentLogs.length > 0 ) {

  		throw fragmentLogs;

  	}

  	this.program = <WebGLProgram> this.gl.createProgram();

  	this.gl.attachShader( this.program, this.vertexShader );
  	this.gl.attachShader( this.program, this.fragmentShader );

  	if ( parameters?.transformFeedbackVaryings ) {

  		console.log( parameters.transformFeedbackVaryings );

  		this.gl.transformFeedbackVaryings(
  			this.program,
  			parameters.transformFeedbackVaryings,
  			this.gl.SEPARATE_ATTRIBS
  		);

  	}

  	this.gl.linkProgram( this.program );

  	if ( ! this.gl.getProgramParameter( this.program, this.gl.LINK_STATUS ) ) {

  		const info = this.gl.getProgramInfoLog( this.program );
  		throw "Could not compile WebGL program. \n\n" + info;

  	}



  	this.gl.deleteShader( this.vertexShader );
  	this.gl.deleteShader( this.fragmentShader );

  }

  setBool( uniform: string, value: number ) {

  	this.gl.uniform1i(
  		this.gl.getUniformLocation( this.program, uniform ),
  		+ value
  	);

  }

  setInt( uniform: string, value: number ) {

  	this.gl.uniform1i( this.gl.getUniformLocation( this.program, uniform ), value );

  }

  setFloat( uniform: string, value: number ) {

  	this.gl.uniform1f( this.gl.getUniformLocation( this.program, uniform ), value );

  }

  setVector2( uniform: string, value: vec2 ) {

  	this.gl.uniform2fv(
  		this.gl.getUniformLocation( this.program, uniform ),
  		value
  	);

  }

  setVector3( uniform: string, value: vec3 ) {

  	this.gl.uniform3fv(
  		this.gl.getUniformLocation( this.program, uniform ),
  		value
  	);

  }

  setVector4( uniform: string, value: vec4 ) {

  	this.gl.uniform4fv(
  		this.gl.getUniformLocation( this.program, uniform ),
  		value
  	);

  }

  setMatrix3( uniform: string, value: mat3 ) {

  	this.gl.uniformMatrix3fv(
  		this.gl.getUniformLocation( this.program, uniform ),
  		false,
  		value
  	);

  }

  setMatrix4( uniform: string, value: mat4 ) {

  	this.gl.uniformMatrix4fv(
  		this.gl.getUniformLocation( this.program, uniform ),
  		false,
  		value
  	);

  }

  setTexture( uniform: string, texture: Texture ) {

  	const exists = this.textures.findIndex( texture => texture.uniformName === uniform );

  	if ( exists != - 1 ) {

  		this.textures[ exists ] = {
  			uniformName: uniform,
  			texture
  		};

  	} else {

  		this.textures.push( {
  			uniformName: uniform,
  			texture
  		} );

  	}



  }

  activate() {

  	this.gl.useProgram( this.program );

  }

  delete() {

  	this.gl.deleteProgram( this.program );

  }

}
