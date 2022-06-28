#version 300 es

precision highp float;

uniform vec3 viewPosition;
uniform samplerCube mapReflection;

out vec4 FragColor;

in vec2 Uv;
in vec3 Normal;
in vec3 Eye;

uniform vec4 baseColor;

void main()
{

    vec3 reflected = reflect( Eye, normalize( Normal ) );

    float m = 2. * sqrt( pow( reflected.x, 2. ) + pow( reflected.y, 2. ) + pow( reflected.z + 1., 2. ) );
    vec2 vN = reflected.xy / m + .5;

    vec3 color = vec3( 1.0 );

    FragColor = vec4( color, 1.0 );

}