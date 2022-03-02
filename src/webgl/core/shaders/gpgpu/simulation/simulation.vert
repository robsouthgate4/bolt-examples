#version 300 es

layout (location = 0) in vec3 tfOldPosition;
layout (location = 1) in vec3 tfOldVelocity;

out vec3 tfNewPosition;

void main() {

  tfNewPosition = tfOldPosition + ( tfOldVelocity * 0.01 );

}