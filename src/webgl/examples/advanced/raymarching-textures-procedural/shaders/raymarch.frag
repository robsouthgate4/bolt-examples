#version 300 es

precision highp float;
precision highp sampler3D;

uniform sampler3D mapVolume;
uniform float time;

out vec4 FragColor;
in vec3 Ro;
in vec3 Rd;
in vec3 FragPosition;

#define MAX_STEPS 128
#define MAX_DIST 10.
#define SURFACE_DIST 1e-3

#define BOX_POS vec3( 0., 0., 0. )
#define BUMP_FACTOR .01
#define TEX_SCALE_FACTOR 6.0
#define PI 3.14159265359
#define TWO_PI ( 2.0 * PI )

uint wang_hash(uint seed) {
  seed = (seed ^ 61u) ^ (seed >> 16u);
  seed *= 9u;
  seed = seed ^ (seed >> 4u);
  seed *= 0x27d4eb2du;
  seed = seed ^ (seed >> 15u);
  return seed;
}

float randomFloat(inout uint seed) {
  return float(wang_hash(seed)) / 4294967296.;
}

void main() {

  float stepSize = 0.01;
  float densityScale = 0.09;

  vec3 rayOrigin = Ro;
  vec3 rayDirection = normalize(Rd);

  float density = 0.0;
  float transmision = 0.0;

  uint seed = uint(gl_FragCoord.x) * uint(1973) + uint(gl_FragCoord.y) * uint(9277) + uint(time) * uint(26699);
  float randNum = randomFloat(seed) * 2.0 - 1.0;

  for(int i = 0; i < MAX_STEPS; i++) {
    rayOrigin += (rayDirection * stepSize);

    float sampledDensity = texture(mapVolume, rayOrigin + vec3(0.5)).r;

    if(density > MAX_DIST) {
      break;
    }

    density += (sampledDensity * densityScale);

  }

  transmision = exp(-density);

  FragColor = vec4(vec3(transmision), 1.0 - transmision);

}