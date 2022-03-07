#version 300 es

precision highp float;

layout( location = 0 ) in vec2 aPosition;
layout( location = 1 ) in vec2 aUv;

out vec2 Uv;

void main() {

  Uv = aUv;

  gl_Position = vec4( aPosition.x, aPosition.y, 0.0, 1.0 );

}