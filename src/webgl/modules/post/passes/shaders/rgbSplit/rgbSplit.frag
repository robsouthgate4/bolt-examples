#version 300 es

precision highp float;
uniform sampler2D map;

in vec2 Uv;

out vec4 FragColor;

void main() {

  float r = texture(map, Uv + vec2(0.002, 0.0)).r;
  float g = texture(map, Uv + vec2(-0.002, 0.0)).g;
  float b = texture(map, Uv + vec2(0.00, -0.004)).b;

  FragColor = vec4(vec3(r, g, b) * 1.0, 1.0);

}