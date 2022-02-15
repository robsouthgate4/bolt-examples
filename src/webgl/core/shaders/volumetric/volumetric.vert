#version 300 es

precision highp float;

layout (location = 0) in vec3 aPosition;
layout (location = 1) in vec3 aNormal;

out vec3 Normal;
out vec3 FragPosition;
out vec3 Ro;
out vec3 HitPos;

uniform mat4 projection;
uniform mat4 model;
uniform mat4 view;
uniform vec3 viewPosition;

void main()
{

  Ro = ( inverse( model ) * vec4( viewPosition, 1.0 ) ).xyz;

  Normal = aNormal;

  FragPosition = vec3( model * vec4( aPosition, 1.0 ) );

  HitPos = aPosition;

  gl_Position = projection * view * model * vec4( aPosition, 1.0 );

}