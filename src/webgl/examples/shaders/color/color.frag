#version 300 es

precision highp float;

uniform vec3 viewPosition;

out vec4 FragColor;

in vec2 Uv;
in vec3 Normal;
in vec3 FragPosition;
in vec3 Color;
in vec3 Color2;
in vec3 Color3;

void main()
{

  FragColor = vec4( Normal, 1.0 );

}