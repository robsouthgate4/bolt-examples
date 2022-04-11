#version 300 es

precision highp float;

layout (location = 0) in vec3 aPosition;
layout (location = 1) in vec3 aNormal;
layout (location = 2) in vec2 aUv;

out vec3 Normal;
out vec2 vUv;
out vec3 FragPosition;

uniform mat4 projection;
uniform mat4 model;
uniform mat4 view;

uniform mat4 camera;

void main()
{


  FragPosition = vec3( model * vec4( aPosition, 1.0 ) );

  gl_Position = projection * view * model * vec4( aPosition, 1.0 );

}