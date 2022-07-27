#version 300 es

precision highp float;

out vec4 FragColor;

in vec3 Normal;
in vec3 WorldPosition;

void main()
{

     vec3 lightPosition = vec3( 0.0, 0.0, 10.0 );

    vec3 norm           = normalize( Normal );
    vec3 lightDirection = normalize( lightPosition - WorldPosition );

    float diffuse = max( dot( Normal, lightDirection ), 0.1 );

    FragColor = vec4( vec3( 0.3 ) + diffuse, 1.0 );
}