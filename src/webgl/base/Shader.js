export default class Shader {
  constructor({ vertexShader, fragmentShader, gl }) {
    this.gl = gl;

    this.vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
    this.gl.shaderSource(this.vertexShader, vertexShader);
    this.gl.compileShader(this.vertexShader);

    console.log(this.gl.getShaderInfoLog(this.vertexShader));

    this.fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
    this.gl.shaderSource(this.fragmentShader, fragmentShader);
    this.gl.compileShader(this.fragmentShader);

    console.log(this.gl.getShaderInfoLog(this.fragmentShader));

    this.program = this.gl.createProgram();
    this.gl.attachShader(this.program, this.vertexShader);
    this.gl.attachShader(this.program, this.fragmentShader);

    this.gl.linkProgram(this.program);

    this.gl.deleteShader(this.vertexShader);
    this.gl.deleteShader(this.fragmentShader);
  }

  activate() {
    this.gl.useProgram(this.program);
  }

  delete() {
    this.gl.deleteProgram(this.program);
  }
}
