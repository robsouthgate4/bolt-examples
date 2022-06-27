#version 300 es

precision highp float;

uniform vec3 objectColor;

out vec4 FragColor;

in vec3 Normal;

in vec3 Color;

void main()
{

	vec3 outColor = vec3(0.2);
	FragColor = vec4( outColor, 1.0 );

}