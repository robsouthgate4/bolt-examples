#version 300 es

precision highp float;

layout(location = 0) in vec3 aPosition;

uniform mat4 projection;
uniform mat4 model;
uniform mat4 view;

void main() {

  vec4 mvPosition = model * view * vec4(aPosition, 1.0);

  gl_PointSize = 2. * (300.0 / -mvPosition.z);
  ;

  gl_Position = projection * mvPosition;
}