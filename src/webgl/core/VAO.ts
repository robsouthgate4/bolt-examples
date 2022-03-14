import VBO from "./VBO";

import Bolt from "./Bolt";

export default class VAO {

    arrayObject: WebGLVertexArrayObject;
    gl: WebGL2RenderingContext;

    constructor() {

    	this.gl = Bolt.getInstance().gl;
    	this.arrayObject = <WebGLVertexArrayObject>( this.gl.createVertexArray() );

    }

    linkVBO( vbo: VBO, layoutID: number ) {

    	vbo.bind();
    	this.gl.enableVertexAttribArray( layoutID );
    	this.gl.vertexAttribPointer( layoutID, 3, this.gl.FLOAT, false, 0, 0 );
    	vbo.unbind();

    }

    linkAttrib( vbo: VBO, layoutID: number, numComponents: number, type: number, stride = 0, offset = 0 ) {

    	vbo.bind();
    	this.gl.enableVertexAttribArray( layoutID );
    	this.gl.vertexAttribPointer( layoutID, numComponents, type, false, stride, offset );
    	vbo.unbind();

    }

    bind() {

    	this.gl.bindVertexArray( this.arrayObject );

    }

    unbind() {

    	this.gl.bindVertexArray( null );

    }

    delete() {

    	this.gl.deleteVertexArray( this.arrayObject );

    }

}
