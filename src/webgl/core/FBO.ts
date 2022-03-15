import Texture from "./Texture";
import Bolt from "./Bolt";

export default class FBO {

    width = 256;
    height = 256;
    format: number;
    targetTexture: Texture;
    frameBuffer: WebGLFramebuffer;
    gl: WebGL2RenderingContext;
    depthTexture?: Texture;

    constructor(
    	{
    		format = Bolt.getInstance().gl.RGBA,
    		width = 256,
    		height = 256,
    		depth = false
    	} = {}
    ) {

    	this.gl = Bolt.getInstance().gl;
    	this.format = format;

    	this.targetTexture = new Texture( this.gl, { width, height } );
    	this.targetTexture.bind();

    	this.frameBuffer = <WebGLFramebuffer>( this.gl.createFramebuffer() );
    	this.gl.bindFramebuffer( this.gl.FRAMEBUFFER, this.frameBuffer );

    	const attachment = this.gl.COLOR_ATTACHMENT0;
    	this.gl.framebufferTexture2D( this.gl.FRAMEBUFFER, attachment, this.gl.TEXTURE_2D, this.targetTexture.texture, 0 );


    	if ( depth ) {

    		const attachment = this.gl.DEPTH_ATTACHMENT;

    		this.depthTexture = new Texture( this.gl, { width, height, depth: true } );
    		this.depthTexture.bind();

    		this.gl.bindFramebuffer( this.gl.FRAMEBUFFER, this.frameBuffer );
    		this.gl.framebufferTexture2D( this.gl.FRAMEBUFFER, attachment, this.gl.TEXTURE_2D, this.depthTexture.texture, 0 );

    	}

    	this.unbind();

    }

    resize( width: number, height: number ) {

    	this.targetTexture.resize( width, height );
    	if ( this.depthTexture ) {

    		this.depthTexture.resize( width, height );

    	}

    }

    bind() {

    	this.gl.bindFramebuffer( this.gl.FRAMEBUFFER, this.frameBuffer );

    }

    unbind() {

    	this.gl.bindFramebuffer( this.gl.FRAMEBUFFER, null );

    }

}
