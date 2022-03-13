#version 300 es

precision highp float;

layout (location = 0) in vec3 aPosition;

layout (location = 1) in vec3 aOffset;

layout (location = 2) in vec3 aNormal;


out vec3 Normal;

uniform mat4 projection;
uniform mat4 model;
uniform mat4 view;

void main()
{

  Normal = aNormal;

  vec3 pos = aPosition * 0.2;

  vec4 mvPosition = model * view * vec4( pos + aOffset, 1.0 );

  gl_Position = projection * mvPosition;
}