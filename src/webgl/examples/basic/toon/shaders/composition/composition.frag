#version 300 es

precision highp float;

uniform sampler2D map;
uniform sampler2D normal;
uniform sampler2D depth;
uniform sampler2D uv;

uniform vec2 resolution;
uniform float thickness;

in vec2 Uv;

out vec4 FragColor;

void makeKernalNormal(inout vec4 n[9], sampler2D tex, vec2 coord, vec2 coordObject) {
	float w = 1.0 / resolution.x + (abs(fract(sin(coordObject.x * 10.))) * 0.0);
	float h = 1.0 / resolution.y + (abs(fract(cos(coordObject.y * 10.))) * 0.0);

	n[0] = texture(tex, coord + (vec2(-w, -h) * thickness));
	n[1] = texture(tex, coord + (vec2(0.0, -h) * thickness));
	n[2] = texture(tex, coord + (vec2(w, -h) * thickness));
	n[3] = texture(tex, coord + (vec2(-w, 0.0) * thickness));
	n[4] = texture(tex, coord);
	n[5] = texture(tex, coord + (vec2(w, 0.0) * thickness));
	n[6] = texture(tex, coord + (vec2(-w, h) * thickness));
	n[7] = texture(tex, coord + (vec2(0.0, h) * thickness));
	n[8] = texture(tex, coord + (vec2(w, h) * thickness));
}

vec4 makeEdge(in vec4[9] n) {
	vec4 sobel_edge_h = n[2] + (2.0 * n[5]) + n[8] - (n[0] + (2.0 * n[3]) + n[6]);
	vec4 sobel_edge_v = n[0] + (2.0 * n[1]) + n[2] - (n[6] + (2.0 * n[7]) + n[8]);
	vec4 sobel = sqrt((sobel_edge_h * sobel_edge_h) + (sobel_edge_v * sobel_edge_v));
	return sobel;
}

void main() {

	vec3 uvColor = texture(uv, Uv).rgb;

	vec4 n3[9];
	makeKernalNormal(n3, normal, Uv, uvColor.rg);

	vec4 n4[9];
	makeKernalNormal(n4, depth, Uv, uvColor.rg);

	vec4 sobelNormal = makeEdge(n3);
	vec4 sobelDepth = makeEdge(n4);

	vec3 outColor = texture(map, Uv).rgb;
	vec3 depthColor = texture(depth, Uv).rgb;

	float sN = 1.0 - length(sobelNormal.rgb);

	float c = sN;

	outColor = mix(vec3(c), outColor, c);

	FragColor = vec4(outColor, 1.0);

}