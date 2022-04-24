#version 300 es

precision highp float;


uniform sampler2D map;
uniform sampler2D normal;
uniform sampler2D depth;

uniform vec2 resolution;
uniform float thickness;

in vec2 Uv;

out vec4 FragColor;


void makeKernalNormal(inout vec4 n[9], sampler2D tex, vec2 coord)
{
	float w = 1.0 / resolution.x + ( abs( fract( sin( coord.x * 500. ) ) ) * 0.001 );
	float h = 1.0 / resolution.y + ( abs( fract( cos( coord.y * 500. ) ) ) * 0.001 );

	n[0] = texture(tex, coord + ( vec2( -w, -h) * thickness ));
	n[1] = texture(tex, coord + ( vec2(0.0, -h) * thickness ));
	n[2] = texture(tex, coord + ( vec2(  w, -h) * thickness ));
	n[3] = texture(tex, coord + ( vec2( -w, 0.0) * thickness ));
	n[4] = texture(tex, coord);
	n[5] = texture(tex, coord + ( vec2(  w, 0.0) * thickness ));
	n[6] = texture(tex, coord + ( vec2( -w, h) * thickness ));
	n[7] = texture(tex, coord + ( vec2(0.0, h) * thickness ));
	n[8] = texture(tex, coord + ( vec2(  w, h) * thickness ));
}

vec4 makeEdge( in vec4[9] n ) {
    vec4 sobel_edge_h = n[2] + (2.0*n[5]) + n[8] - (n[0] + (2.0*n[3]) + n[6]);
  	vec4 sobel_edge_v = n[0] + (2.0*n[1]) + n[2] - (n[6] + (2.0*n[7]) + n[8]);
	vec4 sobel = sqrt((sobel_edge_h * sobel_edge_h) + (sobel_edge_v * sobel_edge_v));
    return sobel;
}

void main() {


    vec4 n3[9];
	makeKernalNormal( n3, normal, Uv );

    vec4 sobelNormal = makeEdge( n3 );

    vec3 outColor = texture( map, Uv ).rgb;

    float sN = 1.0 - length( sobelNormal.rgb );
    sN = pow( smoothstep( 0.0, 1.0, sN ), 0.01 );

    float c = sN;

    outColor = mix( vec3( c ), outColor, c );

    vec3 normals = texture( normal, Uv ).rgb;

    FragColor = vec4( outColor, 1.0 );

}