#version 300 es

precision highp float;

uniform float time;
uniform sampler2D mapVolume;
uniform vec3 viewPosition;

out vec4 FragColor;

in vec3 Normal;
in vec3 FragPosition;
in vec3 HitPos;
in vec3 Ro;
in vec3 Rd;

#define MAX_STEPS 64
#define MAX_DIST 20.
#define SURFACE_DIST 1e-3

#define BOX_POS vec3( 0., 0., 0. )
#define BUMP_FACTOR .01
#define TEX_SCALE_FACTOR 6.0
#define PI 3.14159265359
#define TWO_PI ( 2.0 * PI )


float fresnel(vec3 n, vec3 rd) {
  return pow(clamp(1. - dot(n, -rd), 0., 1.), 3.);
}

vec2 computeSliceOffset(float slice, float slicesPerRow, vec2 sliceSize) {
  return sliceSize * vec2(mod(slice, slicesPerRow),
                          floor(slice / slicesPerRow));
}

vec4 sampleAs3DTexture(
    sampler2D tex, vec3 texCoord, float size, float numRows, float slicesPerRow) {
  float slice   = texCoord.z * size;
  float sliceZ  = floor(slice);                         // slice we need
  float zOffset = fract(slice);                         // dist between slices

  vec2 sliceSize = vec2(1.0 / slicesPerRow,             // u space of 1 slice
                        1.0 / numRows);                 // v space of 1 slice

  vec2 slice0Offset = computeSliceOffset(sliceZ, slicesPerRow, sliceSize);
  vec2 slice1Offset = computeSliceOffset(sliceZ + 1.0, slicesPerRow, sliceSize);

  vec2 slicePixelSize = sliceSize / size;               // space of 1 pixel
  vec2 sliceInnerSize = slicePixelSize * (size - 1.0);  // space of size pixels

  vec2 uv = slicePixelSize * 0.5 + texCoord.xy * sliceInnerSize;
  vec4 slice0Color = texture(tex, slice0Offset + uv);
  vec4 slice1Color = texture(tex, slice1Offset + uv);
  return mix(slice0Color, slice1Color, zOffset);
  return slice0Color;
}

void main()
{

  float stepSize = 0.02;
  float densityScale = 0.1;

  vec3 rayOrigin = Ro;
  vec3 rayDirection = normalize( Rd );

  float density = 0.0;
  float transmision = 0.0;

  for ( int i = 0; i < MAX_STEPS; i++ )
  {
    rayOrigin += ( rayDirection * stepSize );

    float sampledDensity = sampleAs3DTexture( mapVolume, clamp( rayOrigin + vec3( 0.5 ), 0.0, 1.0 ), 64., 8., 8. ).r;

    if( sampledDensity > MAX_DIST )
    {
      break;
    }

    density += ( sampledDensity * densityScale );

  }

  transmision = exp( -density );


  FragColor = vec4( vec3( transmision ), density );

}