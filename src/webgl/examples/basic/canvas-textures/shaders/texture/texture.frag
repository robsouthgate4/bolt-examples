#version 300 es

precision highp float;

uniform sampler2D baseTexture;

uniform vec3 objectColor;
uniform vec3 lightColor;

out vec4 FragColor;

in vec3 Normal;
in vec2 Uv;
in vec3 Color;

void main() {
   FragColor = texture(baseTexture, Uv);
}