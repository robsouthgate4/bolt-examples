#version 300 es

precision highp float;

in vec3 Normal;
in vec4 Position;
in vec3 NormalEyeSpace;

layout( location = 0 ) out vec4 scene;
layout( location = 1 ) out vec4 normal;

uniform vec2 cameraPlanes;

void main() {

    scene = vec4( 1.0 );
    normal = vec4( NormalEyeSpace, 1.0 );

}