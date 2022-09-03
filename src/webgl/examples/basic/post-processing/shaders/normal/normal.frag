#version 300 es

precision highp float;

//uniform sampler2D diffuse;

uniform vec3 objectColor;
uniform vec3 lightColor;

out vec4 FragColor;

in vec3 Normal;

in vec3 Color;

void main() {
   FragColor = vec4(Normal * 0.5 + 0.5, 1.0);
}