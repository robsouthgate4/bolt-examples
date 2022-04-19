#version 300 es

precision highp float;

in vec3 Normal;

layout( location = 0 ) out vec4 scene;
layout( location = 1 ) out vec4 normal;

void main() {

    scene = vec4( 1.0 );
    normal = vec4( normalize( Normal * 0.5 + 0.5 ), 1.0 );

}