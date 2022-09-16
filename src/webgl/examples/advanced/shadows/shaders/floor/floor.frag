#version 300 es

precision highp float;

uniform vec3 viewPosition;

out vec4 FragColor;

in vec2 Uv;
in vec3 Normal;
in vec3 FragPosition;
in vec3 Color;
in vec4 ShadowCoord;

uniform sampler2D shadowMap;
uniform float shadowStrength;

float getShadow( vec4 shadowCoord )
{
    vec3 projCoords = shadowCoord.xyz / shadowCoord.w;

    projCoords = projCoords * 0.5 + 0.5;

    if(projCoords.z < 0.0 || projCoords.z > 1.0 || projCoords.x < 0.0 || projCoords.x > 1.0 || projCoords.y < 0.0 || projCoords.y > 1.0) {
        return 0.0;
    }

    float currentDepth = projCoords.z;

    float bias = 0.005;

    float shadow = 0.0;
    vec2 texelSize = 1.0 / vec2( textureSize( shadowMap, 0 ) );

    for(int x = -1; x <= 1; ++x)
    {
        for(int y = -1; y <= 1; ++y)
        {
            float pcfDepth = texture( shadowMap, projCoords.xy + vec2( x, y ) * texelSize ).r;
            shadow += currentDepth - bias > pcfDepth ? 1.0 : 0.0;
        }
    }

    shadow /= 9.0;

    return shadow;
}


void main() {

    float shadow = getShadow( ShadowCoord );

    FragColor = vec4( vec3( 1.0 - ( shadow * shadowStrength ) ), 1.0);

}