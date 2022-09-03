#version 300 es

precision highp float;

uniform vec3 viewPosition;

out vec4 FragColor;

in vec3 Normal;
in vec3 FragPosition;

uniform vec4 baseColor;

void main() {

    FragColor = vec4(Normal * 0.5 + 0.5, 1.0);

}