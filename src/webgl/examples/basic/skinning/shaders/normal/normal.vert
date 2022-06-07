#version 300 es

precision highp float;

layout (location = 0) in vec3 aPosition;
layout (location = 1) in vec3 aNormal;
layout (location = 2) in vec2 aUv;

layout (location = 5) in vec4 aJoints;
layout (location = 6) in vec4 aWeights;

out vec3 Normal;

uniform mat4 projection;
uniform mat4 model;
uniform mat4 view;
uniform mat4 normal;

void main()
{

  Normal = ( normal * vec4( aNormal, 0.0 ) ).xyz;

  gl_Position = projection * view * model * vec4( aPosition, 1.0 );
}