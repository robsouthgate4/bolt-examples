#version 300 es

precision highp float;

uniform vec3 viewPosition;
uniform float time;

out vec4 FragColor;

in vec2 Uv;
in vec3 Normal;
in vec3 FragPosition;
in vec3 Color;

uniform vec4 baseColor;
uniform sampler2D baseTexture;

void main()
{
    vec3 ambient = vec3(0.8, 0.8, 0.9);
    vec3 lightColor = vec3(1.0, 1.0, 1.0);

    vec3 lightPosition = vec3( 10.0 * sin( time ), 10.0, 0.0 );

    // get light direction
    vec3 lightDirection = normalize( lightPosition - FragPosition );

    // get diffuse lighting
    float diff = max( dot( Normal, lightDirection ), 0.0 );

    float diffuse = diff * lightColor.r;

    vec4 color = texture( baseTexture, Uv );

    FragColor = vec4( ( ambient + diffuse ) * baseColor.rgb, 1.0 );

}