#version 300 es

precision highp float;

layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 aColor;
layout (location = 2) in vec2 aUv;

out vec3 vColor;
out vec2 vUv;

void main()
{

  vColor = aColor;
  vUv = aUv;

  gl_Position = vec4( aPos.x, aPos.y, aPos.z, 1.0 );
}