#version 300 es

precision highp float;

uniform sampler2D diffuse;

out vec4 FragColor;

in vec3 vColor;
in vec2 vUv;

void main()
{
   FragColor = texture( diffuse, vUv );
}