#version 300 es

precision highp float;

out vec4 FragColor;

in vec3 Normal;
in vec3 Eye;
in vec4 ShadowCoord;
in vec3 FragPosition;

uniform vec3 lightPosition;
uniform sampler2D baseTexture;
uniform sampler2D shadowMap;
uniform float shadowStrength;

float getShadow( vec4 shadowCoord, vec3 lightDirection )
{
    vec3 projCoords = shadowCoord.xyz / shadowCoord.w;

    projCoords = projCoords * 0.5 + 0.5;

    if(projCoords.z < 0.0 || projCoords.z > 1.0 || projCoords.x < 0.0 || projCoords.x > 1.0 || projCoords.y < 0.0 || projCoords.y > 1.0) {
        return 0.0;
    }

    float currentDepth = projCoords.z;

    float bias = max( 0.05 * ( 1.0 - dot( Normal, lightDirection ) ), 0.005 );

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

    vec3 reflected = reflect(Eye, normalize(Normal));

    float m = 2. * sqrt(pow(reflected.x, 2.) + pow(reflected.y, 2.) + pow(reflected.z + 1., 2.));
    vec2 vN = reflected.xy / m + .5;

    vec3 lightDirection  = normalize( lightPosition - FragPosition );

    float shadow = getShadow( ShadowCoord, lightDirection );

    vec4 color = texture(baseTexture, vN);

    FragColor = vec4(color.rgb * ( 1.0 - ( shadow * shadowStrength ) ), 1.0);

}