#version 300 es

precision highp float;

//uniform vec3 objectColor;
//uniform vec3 lightColor;
uniform sampler2D baseTexture;
//uniform sampler2D jointTexture;

out vec4 FragColor;

in vec3 Normal;
in vec2 Uv;

void main() {

   vec3 baseColor = texture(baseTexture, Uv).rgb;

   FragColor = vec4(baseColor, 1.0);

}