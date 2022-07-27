#version 300 es

precision highp float;


layout (location = 0) in vec3 aPosition;
layout (location = 1) in vec3 aNormal;
layout (location = 2) in vec2 aUv;

in vec3 aColor;
in uint aIndex;

out vec3 Normal;
out vec2 Uv;
out vec3 FragPosition;

out vec3 Color;

flat out uint Index;

uniform mat4 projection;
uniform mat4 model;
uniform mat4 view;

uniform mat4 camera;

void main()
{
    Uv = aUv;

    Normal = aNormal;

    Color = aColor;

    Index = aIndex;

    vec3 pos = aPosition;

    FragPosition = vec3( model * vec4( pos, 1.0 ) );

    gl_Position = projection * view * model * vec4( aPosition, 1.0 );

}