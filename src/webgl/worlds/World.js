import Base from "@webgl/Base";
import { glSettings } from "@webgl/globals/Constants";
import IBO from "../base/IBO";
import VAO from "../base/VAO";
import VBO from "../base/VBO";
import Shader from "../base/Shader";

import vertexShader from "../shaders/default/default.vert";
import fragmentShader from "../shaders/default/default.frag";
import Texture from "../base/Texture";

export default class World extends Base {
  constructor() {
    super();

    this.canvas = document.getElementById("experience");
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.gl = this.canvas.getContext("webgl2");

    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

    const vertices = [
      -0.5, -0.5, 0,  1.0, 0.0, 0.0, 0.0, 0.0,
      -0.5, 0.5, 0,   0.0, 1.0, 0.0, 0.0, 1.0,
      0.5, 0.5, 0,    0.0, 0.0, 1.0, 1.0, 1.0,
      0.5, -0.5, 0,   1.0, 1.0, 1.0, 1.0, 0.0
    ];

    const indices = [
      0, 2, 1,
      0, 3, 2
    ];

    this.shader = new Shader({ vertexShader, fragmentShader, gl: this.gl });

    this.texture = new Texture({
      imagePath:"/static/textures/clouds.jpeg",
      type: this.gl.TEXTURE_2D,
      format: this.gl.RGBA,
      pixelType: this.gl.UNSIGNED_BYTE,
      gl: this.gl
    });

    this.texture.loadImage();
    this.texture.textureUnit( this.shader, "diffuse", 0);

    this.vao = new VAO({ gl: this.gl });
    this.vao.bind();

    this.vbo = new VBO({ vertices, gl: this.gl });
    this.ibo = new IBO({ indices, gl: this.gl });

    this.vao.linkAttrib({ vbo: this.vbo, layoutID: 0, numComponents: 3, type: this.gl.FLOAT, stride: 8 * 4, offset: 0 * 4 })
    this.vao.linkAttrib({ vbo: this.vbo, layoutID: 1, numComponents: 3, type: this.gl.FLOAT, stride: 8 * 4, offset: 3 * 4 })
    this.vao.linkAttrib({ vbo: this.vbo, layoutID: 2, numComponents: 2, type: this.gl.FLOAT, stride: 8 * 4, offset: 6 * 4 })

    this.vao.unbind();
    this.vbo.unbind();
    this.ibo.unbind();

    this.resize();
  }

  resize() {
    let w = window.innerWidth;
    let h = window.innerHeight;
  }

  earlyUpdate(elapsed, delta) {
    super.earlyUpdate(elapsed, delta);
  }

  update(elapsed, delta) {
    super.update(elapsed, delta);

    this.gl.clearColor(0.08, 0.13, 0.17, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    this.shader.activate();
    this.texture.bind();

    this.vao.bind();

    this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0);
  }

  lateUpdate(elapsed, delta) {
    super.lateUpdate(elapsed, delta);
  }
}
