#version 300 es

precision highp float;

out vec4 FragColor;

in vec2 Uv;

in vec3 Normal;

void main()
{
   FragColor = vec4( vec3( 0.5 ), 1.0 );
}