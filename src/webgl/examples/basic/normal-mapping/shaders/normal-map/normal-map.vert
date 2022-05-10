#version 300 es

precision highp float;


layout (location = 0) in vec3 aPosition;
layout (location = 1) in vec3 aNormal;
layout (location = 2) in vec2 aUv;

out vec3 Normal;
out vec3 Eye;
out vec3 WorldPosition;
out vec2 Uv;

uniform mat4 projection;
uniform mat4 model;
uniform mat4 view;
uniform mat4 normal;

void main()
{

    Normal = normalize( normal * vec4( aNormal, 0.0 ) ).xyz;

    WorldPosition = ( model * vec4( aPosition, 1.0 ) ).xyz;

    Uv = aUv;

    mat4 mvp = projection * view * model;

    Eye = normalize( mvp * vec4( aPosition, 1.0 ) ).xyz;

    gl_Position = mvp * vec4( aPosition, 1.0 );

}