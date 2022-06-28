#version 300 es

precision highp float;

uniform vec3 viewPosition;

uniform samplerCube mapCube;

out vec4 FragColor;

in vec2 Uv;
in vec3 Normal;
in vec3 FragPosition;

void main()
{

  FragColor = vec4( Normal * 0.5 + 0.5, 1.0 );


}