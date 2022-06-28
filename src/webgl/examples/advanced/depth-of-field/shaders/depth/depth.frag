#version 300 es

precision highp float;

out vec4 FragColor;

in vec3 Normal;

in vec3 Color;
in vec4 Position;

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

void main()
{

    float depthOffset = 0.0;

    float linearDepth = 1.0 / ( cameraPlanes.y - cameraPlanes.x );

    float linear    = linearDepth * length( Position.xyz );
    vec4  conColor = convRGBA( convCoord( linear, depthOffset ) );

    FragColor = vec4( conColor.rgb, 1.0 );
}