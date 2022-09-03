#version 300 es

precision highp float;

uniform sampler2D map;
uniform float xPixels;
uniform float yPixels;

in vec2 Uv;

out vec4 FragColor;

void main() {

  vec2 texCoords = vec2(floor(Uv.s * xPixels) / xPixels, floor(Uv.t * yPixels) / yPixels);

  FragColor = texture(map, texCoords);

}