#version 300 es

precision highp float;

uniform vec3 viewPosition;

out vec4 FragColor;

in vec2 Uv;
in vec3 Normal;
in vec3 Eye;

uniform vec4 baseColor;

void main()
{

    FragColor = vec4( baseColor.rgb, 1.0 );

}