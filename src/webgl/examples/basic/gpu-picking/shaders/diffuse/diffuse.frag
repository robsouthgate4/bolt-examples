#version 300 es

precision highp float;

uniform vec3 viewPosition;

out vec4 FragColor;

in vec2 Uv;
in vec3 Normal;
in vec3 Eye;
in vec3 WorldPosition;

uniform vec4 baseColor;

void main()
{

    vec3 lightPosition = vec3( 0.0, 5.0, 10.0 );

    vec3 norm           = normalize( Normal );
    vec3 lightDirection = normalize( lightPosition - WorldPosition );

    float diffuse = max( dot( Normal, lightDirection ), 0.5 );

    FragColor = vec4( baseColor.rgb * diffuse, 0.5 );

}