#version 300 es

precision highp float;

layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec2 aUV;

layout(location = 3) in mat4 instance;

out vec3 Normal;
out vec4 Position;

uniform mat4 projection;
uniform mat4 model;
uniform mat4 view;

void main() {

  Normal = aNormal;

  Position = projection * view * instance * vec4(aPosition, 1.0);

  gl_Position = Position;
}