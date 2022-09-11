#version 300 es

precision highp float;

uniform vec3 viewPosition;

out vec4 FragColor;

in vec2 Uv;
in vec3 Normal;
in vec3 FragPosition;
in vec3 Color;
in vec4 ShadowCoord;

uniform vec4 baseColor;
uniform sampler2D shadowMap;

float unpackRGBA (vec4 v) {
        return dot(v, 1.0 / vec4(1.0, 255.0, 65025.0, 16581375.0));
    }

void main() {

    vec3 projCoords = ShadowCoord.xyz / ShadowCoord.w;

    projCoords = projCoords * 0.5 + 0.5;

    float closestDepth = texture(shadowMap, projCoords.xy).r;

    float currentDepth = projCoords.z;

    float bias = 0.001;

    float shadow = (currentDepth - bias) < closestDepth ? 0.0 : 0.2;

    if(projCoords.z > 1.0)
        shadow = 0.0;

    FragColor = vec4(vec3(1.0 - shadow), 1.0);

    //FragColor = vec4( vec3( texture( shadowMap, Uv ).rrr ) , 1.0);

}