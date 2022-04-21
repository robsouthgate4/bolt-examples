#version 300 es

precision highp float;

layout (location = 0) in vec3 oldPosition;
layout (location = 1) in vec3 oldVelocity;

out vec3 newPosition;

void main() {

  newPosition = oldPosition + ( oldVelocity * 0.01 );

}