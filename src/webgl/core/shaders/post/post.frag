#version 300 es

precision highp float;

out vec4 FragColor;
in vec2 Uv;

uniform sampler2D map;

void main() {

  FragColor = texture( map, Uv );

}