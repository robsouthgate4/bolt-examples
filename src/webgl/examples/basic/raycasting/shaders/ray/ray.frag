#version 300 es

precision highp float;

out vec4 FragColor;

in vec3 Normal;

in vec3 Color;

void main()
{
   FragColor = vec4( vec3( 0.0 ), 1.0 );
}