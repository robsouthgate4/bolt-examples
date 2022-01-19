#version 300 es

precision highp float;

layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 aColor;
layout (location = 2) in vec2 aUv;

out vec3 vColor;
out vec2 vUv;

uniform mat4 projection;
uniform mat4 model;
uniform mat4 view;

uniform mat4 camera;

void main()
{

  vColor = aColor;
  vUv = aUv;

  gl_Position = camera * model * vec4( aPos, 1.0 );
}