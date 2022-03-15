import Shader from "./Shader";

export default class Texture {

    imagePath: string;
    pixelType: number;
    format: number;
    gl: WebGL2RenderingContext;
    texture: WebGLTexture;
    wrapT!: number;
    wrapS!: number;
    depth?: boolean;
    height!: number;
    width!: number;

    constructor(
    	gl: WebGL2RenderingContext,
    	{
    		imagePath = "",
    		wrapS = gl.CLAMP_TO_EDGE,
    		wrapT = gl.CLAMP_TO_EDGE,
    		width = 256,
    		height = 256,
    		depth = false
    	} = {}
    ) {

    	this.gl = gl;
    	this.width = width;
    	this.height = height;
    	this.depth = depth;
    	this.format = this.gl.RGBA;
    	this.pixelType = this.gl.UNSIGNED_BYTE;
    	this.imagePath = imagePath;

    	this.wrapT = wrapT || this.gl.CLAMP_TO_EDGE;
    	this.wrapS = wrapS || this.gl.CLAMP_TO_EDGE;

    	this.texture = <WebGLTexture>( this.gl.createTexture() );
    	this.gl.bindTexture( this.gl.TEXTURE_2D, this.texture );

    	if ( ! depth ) {

    		this.gl.texImage2D( this.gl.TEXTURE_2D, 0, this.format, width, height, 0, this.format, this.gl.UNSIGNED_BYTE, null );
    		this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST );
    		this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR );

    		this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.wrapS );
    		this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.wrapT );

    	} else {

    		const level = 0;
    		const internalFormat = this.gl.DEPTH_COMPONENT24;
    		const border = 0;
    		const format = this.gl.DEPTH_COMPONENT;
    		const type = this.gl.UNSIGNED_INT;
    		const data = null;

    		this.gl.texImage2D( this.gl.TEXTURE_2D, level, internalFormat,
    			width, height, border,
    			format, type, data );

    		this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST );
    		this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST );
    		this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT );
    		this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT );

    	}

    }

    resize( width: number, height: number ) {

    	this.bind();

    	if ( this.depth ) {

    		const level = 0;
    		const internalFormat = this.gl.DEPTH_COMPONENT24;
    		const border = 0;
    		const format = this.gl.DEPTH_COMPONENT;
    		const type = this.gl.UNSIGNED_INT;
    		const data = null;

    		this.gl.texImage2D( this.gl.TEXTURE_2D, level, internalFormat,
    			width, height, border,
    			format, type, data );

    	} else {

    		this.gl.texImage2D( this.gl.TEXTURE_2D, 0, this.format, width, height, 0, this.format, this.gl.UNSIGNED_BYTE, null );

    	}

    	this.unbind();


    }

    textureUnit( shader: Shader, uniformName: string, unit: number ) {


    	shader.activate();
    	const textureUnit = this.gl.getUniformLocation( shader.program, uniformName );
    	this.gl.activeTexture( this.gl.TEXTURE0 + unit );
    	this.bind();
    	this.gl.uniform1i( textureUnit, unit );


    }

    setWrapS( value: number ) {

    	this.bind();
    	this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, value );
    	this.unbind();

    }

    setWrapT( value: number ) {

    	this.bind();
    	this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, value );
    	this.unbind();

    }

    bind() {

    	this.gl.bindTexture( this.gl.TEXTURE_2D, this.texture );

    }

    unbind() {

    	this.gl.bindTexture( this.gl.TEXTURE_2D, null );

    }

    delete() {

    	this.gl.deleteTexture( this.texture );

    }

    isPowerOf2( value: number ) {

    	return ( value & ( value - 1 ) ) == 0;

    }

    loadImage() {

    	const image = new Image();
    	image.src = this.imagePath;

    	image.addEventListener( "load", () => {

    		this.gl.bindTexture( this.gl.TEXTURE_2D, this.texture );
    		this.gl.texImage2D( this.gl.TEXTURE_2D, 0, this.format, this.format, this.pixelType, image );

    		this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.wrapS );
    		this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.wrapT );
    		this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR );

    		if ( this.isPowerOf2( image.width ) && this.isPowerOf2( image.height ) ) {

    			this.gl.generateMipmap( this.gl.TEXTURE_2D );

    		}

    		this.gl.bindTexture( this.gl.TEXTURE_2D, null );

    	} );

    }

}
