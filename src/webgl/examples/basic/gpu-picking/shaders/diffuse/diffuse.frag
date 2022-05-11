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

    vec3 lightPosition = vec3( 10.0, 5.0, 30.0 );
    float diffuse = dot( Normal, lightPosition ) * 1.0;

    FragColor = vec4( baseColor.rgb * diffuse, 1.0 );

}