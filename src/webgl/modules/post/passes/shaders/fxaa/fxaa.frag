#version 300 es

precision highp float;

uniform sampler2D map;
uniform vec2 resolution;

in vec2 Uv;

in vec2 v_rgbNW;
in vec2 v_rgbNE;
in vec2 v_rgbSW;
in vec2 v_rgbSE;
in vec2 v_rgbM;

out vec4 FragColor;

#define FXAA_REDUCE_MIN   (1.0/128.0)
#define FXAA_REDUCE_MUL   (1.0/64.0)
#define FXAA_SPAN_MAX     16.0

mediump float when_gt(float x, float y) {
  return max(sign(x - y), 0.0);
}

mediump float when_lt(float x, float y) {
  return max(sign(y - x), 0.0);
}

mediump float orValue(float a, float b) {
  return min(a + b, 1.0);
}

void main() {

  vec2 res = vec2(1.0) / resolution;

  vec3 rgbNW = texture(map, v_rgbNW).xyz;
  vec3 rgbNE = texture(map, v_rgbNE).xyz;
  vec3 rgbSW = texture(map, v_rgbSW).xyz;
  vec3 rgbSE = texture(map, v_rgbSE).xyz;
  vec4 rgbaM = texture(map, v_rgbM);

  vec3 rgbM = rgbaM.xyz;
  vec3 luma = vec3(0.299, 0.587, 0.114);

  float lumaNW = dot(rgbNW, luma);
  float lumaNE = dot(rgbNE, luma);
  float lumaSW = dot(rgbSW, luma);
  float lumaSE = dot(rgbSE, luma);
  float lumaM = dot(rgbM, luma);
  float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));
  float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));

  mediump vec2 dir;
  dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));
  dir.y = ((lumaNW + lumaSW) - (lumaNE + lumaSE));

  float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) * (0.25 * FXAA_REDUCE_MUL), FXAA_REDUCE_MIN);

  float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);
  dir = min(vec2(FXAA_SPAN_MAX, FXAA_SPAN_MAX), max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX), dir * rcpDirMin)) * res;
  vec4 rgbA = (1.0 / 2.0) * (texture(map, Uv.xy + dir * (1.0 / 3.0 - 0.5)) +
    texture(map, Uv.xy + dir * (2.0 / 3.0 - 0.5)));
  vec4 rgbB = rgbA * (1.0 / 2.0) + (1.0 / 4.0) * (texture(map, Uv.xy + dir * (0.0 / 3.0 - 0.5)) +
    texture(map, Uv.xy + dir * (3.0 / 3.0 - 0.5)));
  float lumaB = dot(rgbB, vec4(luma, 0.0));

  float conditional = orValue(when_lt(lumaB, lumaMin), when_gt(lumaB, lumaMax));

  FragColor = mix(rgbB, rgbA, conditional);

}