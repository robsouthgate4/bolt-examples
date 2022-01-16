export default class VAO {
  constructor({ gl }) {
    this.gl = gl;
    this.vao = this.gl.createVertexArray();
  }

  linkVBO({ vbo, layoutID }) {
    vbo.bind();
    this.gl.vertexAttribPointer(layoutID, 3, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(layoutID);
    vbo.unbind();
  }

  linkAttrib({ vbo, layoutID, numComponents, type, stride, offset }) {
    vbo.bind();
    this.gl.vertexAttribPointer(layoutID, numComponents, type, false, stride, offset);
    this.gl.enableVertexAttribArray(layoutID);
    vbo.unbind();
  }

  bind() {
    this.gl.bindVertexArray(this.vao);
  }

  unbind() {
    this.gl.bindVertexArray(null);
  }

  delete() {
    this.gl.deleteVertexArray(this.vao);
  }
}
