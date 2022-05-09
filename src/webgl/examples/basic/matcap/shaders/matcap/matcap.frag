#version 300 es

precision highp float;

uniform vec3 viewPosition;

out vec4 FragColor;

in vec2 Uv;
in vec3 Normal;
in vec3 Eye;

uniform vec4 baseColor;
uniform sampler2D baseTexture;

void main()
{

    vec3 reflected = reflect( Eye, normalize( Normal ) );

    float m = 2. * sqrt( pow( reflected.x, 2. ) + pow( reflected.y, 2. ) + pow( reflected.z + 1., 2. ) );
    vec2 vN = reflected.xy / m + .5;

    vec4 color = texture( baseTexture, vN );

    FragColor = vec4( color.rgb, 1.0 );

}