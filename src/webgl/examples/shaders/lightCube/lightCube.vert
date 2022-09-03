#version 300 es

precision highp float;

layout(location = 0) in vec3 aPositionition;
layout(location = 1) in vec3 aNormal;

uniform mat4 projection;
uniform mat4 model;
uniform mat4 view;

out vec3 vNormal;

void main() {

  vNormal = aNormal;

  gl_Position = projection * view * model * vec4(aPositionition, 1.0);
}