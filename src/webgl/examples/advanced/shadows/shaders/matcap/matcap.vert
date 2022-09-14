#version 300 es

precision highp float;

layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec2 aUv;

out vec3 Normal;
out vec3 Eye;
out vec4 ShadowCoord;
out vec3 FragPosition;

uniform mat4 projection;
uniform mat4 model;
uniform mat4 view;
uniform mat4 normal;

uniform mat4 lightSpaceMatrix;

void main() {

    Normal = normalize(normal * vec4(aNormal, 0.0)).xyz;

    FragPosition = vec3( model * vec4( aPosition, 1.0 ) );

    mat4 mvp = projection * view * model;

    Eye = normalize(mvp * vec4(aPosition, 1.0)).xyz;

    ShadowCoord = lightSpaceMatrix * model * vec4( aPosition, 1.0 );

    gl_Position = mvp * vec4(aPosition, 1.0);

}