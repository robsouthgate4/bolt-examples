#version 300 es

precision highp float;

in vec3 Normal;
in vec4 Position;
in vec3 NormalEyeSpace;

layout( location = 0 ) out vec4 scene;
layout( location = 1 ) out vec4 normal;
layout( location = 2 ) out vec4 depth;

uniform vec2 cameraPlanes;

vec4 convRGBA(float depth){
    float r = depth;
    float g = fract(r * 255.0);
    float b = fract(g * 255.0);
    float a = fract(b * 255.0);
    float coef = 1.0 / 255.0;
    r -= g * coef;
    g -= b * coef;
    b -= a * coef;
    return vec4(r, g, b, a);
}

float convCoord(float depth, float offset){
    float d = clamp(depth + offset, 0.0, 1.0);
    if(d > 0.5){
        d = 2.5 * (1.0 - d);
    }else if(d > 0.4){
        d = 1.0;
    }else{
        d *= 2.5;
    }
    return d;
}

void main() {

    scene = vec4( 1.0 );
    normal = vec4( NormalEyeSpace, 1.0 );

    float depthOffset = 0.0;
    float linearDepth = 1.0 / ( cameraPlanes.y - cameraPlanes.x );
    float linear      = linearDepth * length( Position.xyz );
    float d           = convRGBA( convCoord( linear, depthOffset ) ).r;

    depth = vec4( vec3( d ), 1.0 );

}