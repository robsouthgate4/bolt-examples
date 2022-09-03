#version 300 es

precision highp float;

layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec2 aUv;
layout(location = 3) in vec3 aColor3;

in vec3 aColor;
in vec3 aColor2;

out vec3 Normal;
out vec2 Uv;
out vec3 FragPosition;

out vec3 Color;
out vec3 Color2;
out vec3 Color3;

uniform mat4 projection;
uniform mat4 model;
uniform mat4 view;

uniform mat4 camera;

void main() {

    Color = aColor;
    Color2 = aColor2;
    Color3 = aColor3;

    Uv = aUv;

    Normal = aNormal;

    FragPosition = vec3(model * vec4(aPosition, 1.0));

    gl_Position = projection * view * model * vec4(aPosition, 1.0);

}