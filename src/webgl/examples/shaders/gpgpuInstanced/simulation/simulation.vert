#version 300 es

layout (location = 0) in vec3 tfOldPosition;
layout (location = 1) in vec3 tfOldVelocity;

out vec3 tfNewPosition;
out vec3 tfNewVelocity;

void main() {

  vec3 gravity = vec3( 0.0, -1.0, 0.0 );

  vec3 velnew = tfOldVelocity + gravity * 0.01;
  vec3 posnew = tfOldPosition + velnew * 0.1;

  if( posnew.y < 0. ){
    velnew.y = -velnew.y;
  }

  tfNewPosition = posnew;
  tfNewVelocity = velnew;

}