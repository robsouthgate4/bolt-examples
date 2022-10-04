#version 300 es

precision highp float;

layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec2 aUV;
layout(location = 3) in mat4 instance;

in vec3 aColor;

out vec3 Normal;
out vec3 Color;

uniform mat4 projection;
uniform mat4 model;
uniform mat4 view;

void main() {

  Normal = aNormal;
  Color = aColor;

  gl_Position = projection * view * model * instance * vec4(aPosition, 1.0);
}