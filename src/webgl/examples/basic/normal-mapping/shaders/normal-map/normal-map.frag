#version 300 es

precision highp float;

uniform vec3 viewPosition;

out vec4 FragColor;

in vec2 Uv;
in vec3 Normal;
in vec3 Eye;
in vec3 WorldPosition;

uniform vec4 baseColor;
uniform sampler2D baseTexture;
uniform sampler2D normalTexture;
uniform vec2 normalUVScale;
uniform float normalHeight;
uniform mat4 view;

// perturbed normals. No tangent data required
vec3 generaterNormal() {

    vec3 posDx      = dFdx( WorldPosition.xyz );
    vec3 posDy      = dFdy( WorldPosition.xyz );
    vec2 textureDx  = dFdx( Uv );
    vec2 textureDy  = dFdy( Uv );

    // calculate tangent
    vec3 t          = normalize( posDx * textureDy.t - posDy * textureDx.t );
    // calculate bi-normal
    vec3 b          = normalize( -posDx * textureDy.s + posDy * textureDx.s );
    // generate tbn matrix
    mat3 tbn        = mat3( t, b, normalize( Normal ) );

    vec3 n          = texture( normalTexture, Uv * normalUVScale).rgb * 2.0 - 1.0;
         n.xy      *= normalHeight;
    vec3 normal     = normalize( tbn * n );

    return normalize( ( vec4( normal, 0.0 ) * view ).xyz);
}

void main()
{

    vec3 normal = generaterNormal();

    vec3 reflected = reflect( Eye, normalize( normal ) );

    float m = 2. * sqrt( pow( reflected.x, 2. ) + pow( reflected.y, 2. ) + pow( reflected.z + 1., 2. ) );
    vec2 vN = reflected.xy / m + .5;

    vec4 color = texture( baseTexture, vN );

    vec3 lightPosition = vec3( -5.0, 10.0, 10.0 );
    float diffuse = dot( normal, lightPosition ) * 0.1;
    diffuse = min( 0.8, max( diffuse, 0.5 ) );

    FragColor = vec4( color.rgb * diffuse, 1.0 );

}