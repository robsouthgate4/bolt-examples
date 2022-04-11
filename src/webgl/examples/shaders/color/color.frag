#version 300 es

precision highp float;

// uniform vec3 objectColor;
// uniform vec3 lightColor;
// uniform vec3 lightPosition;
uniform vec3 viewPosition;
// uniform sampler2D map0;
// uniform sampler2D map1;

out vec4 FragColor;

in vec2 vUv;
in vec3 Normal;
in vec3 FragPosition;

void main()
{

  FragColor = vec4( vec3( 1.0, 0.0, 0.0 ), 1.0 );

}