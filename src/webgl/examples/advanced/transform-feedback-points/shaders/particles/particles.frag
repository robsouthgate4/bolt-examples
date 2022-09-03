#version 300 es

precision highp float;

out vec4 FragColor;

void main() {

   vec2 xy = gl_PointCoord.xy;

   float mask = smoothstep(0.2, 0.5, distance(xy, vec2(0.5, 0.5)));

   if(mask > 0.5)
      discard;

   FragColor = vec4(vec3(0.1, 0.8, 0.5), 1.0 - mask);
}