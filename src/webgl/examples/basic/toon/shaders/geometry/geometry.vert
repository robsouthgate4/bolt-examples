#version 300 es

layout( location = 0 ) in vec3 aPosition;
layout( location = 1 ) in vec3 aNormal;
layout( location = 2 ) in vec2 aUv;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;
uniform mat4 normal;

out vec4 Position;
out vec2 Uv;
out vec3 Normal;
out vec3 NormalEyeSpace;
out vec3 WorldPosition;

void main() {

    Normal = aNormal;

    WorldPosition = ( model * vec4( aPosition, 1.0 ) ).xyz;

    Uv = aUv;

    mat4 modelView = view * model;

    NormalEyeSpace = vec3( modelView * vec4( Normal, 0.0 ) ).xyz;

    Position = projection * modelView * vec4( aPosition, 1.0 );

    gl_Position = Position;

}