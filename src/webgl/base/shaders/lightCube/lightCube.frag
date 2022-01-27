#version 300 es

precision highp float;

uniform vec3 lightColor;
uniform vec3 viewPosition;

out vec4 FragColor;

in vec3 vColor;
in vec2 vUv;

void main()
{

  float specularStrength = 0.5;

  FragColor = vec4( lightColor, 1.0 );
}