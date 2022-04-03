#version 300 es

precision highp float;

layout (location = 0) in vec3 aPosition;
layout (location = 1) in vec3 aOffset;
layout (location = 2) in vec3 aNormal;
layout (location = 3) in vec2 aUv;


out vec3 Normal;
out vec2 Uv;

uniform mat4 projection;
uniform mat4 model;
uniform mat4 view;

void main()
{

  Normal = aNormal;

  Uv =  aUv;

  vec3 pos = aPosition;

  vec4 mvPosition = model * view * vec4( pos + aOffset, 1.0 );

  gl_Position = projection * mvPosition;
}