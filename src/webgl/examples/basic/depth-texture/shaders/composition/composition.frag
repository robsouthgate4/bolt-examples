#version 300 es

precision highp float;

uniform sampler2D map;
uniform sampler2D mapDepth;

in vec2 Uv;

out vec4 FragColor;

uniform vec2 cameraPlanes;

float linearizeDepth(in vec2 uv) {

  float n = cameraPlanes.x;
  float f = cameraPlanes.y;
  float d = texture(mapDepth, uv).x;

  float z = d * 2.0 - 1.0;

  return (2.0 * n * f) / (f + n - z * (f - n));

}

void main() {

  float depth = 1.0 - linearizeDepth(Uv) / cameraPlanes.y; // divide by camera far plane to get depth in [0,1]

  FragColor = vec4( vec3(depth), 1.0);

}