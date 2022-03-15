#version 300 es

precision highp float;


uniform sampler2D   map;
uniform sampler2D   depthMap;

in vec2 Uv;
out vec4 FragColor;

void main() {

    vec3 col = texture( map, Uv ).rgb;
    float depth = texture( depthMap, Uv ).r;

    FragColor = vec4( vec3( depth ), 1.0 );

}