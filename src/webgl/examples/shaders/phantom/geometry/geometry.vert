#version 300 es

layout( location = 0 ) in vec3 aPosition;
layout( location = 1 ) in vec3 aNormal;
layout( location = 2 ) in vec2 aUv;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

out vec4 Position;
out vec2 Uv;
out vec3 Normal;

void main() {

    Normal = aNormal;
    Uv = aUv;

    gl_Position = projection * view * model * vec4( aPosition, 1.0 );

}