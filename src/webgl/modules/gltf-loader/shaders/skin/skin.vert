#version 300 es

precision highp float;


layout (location = 0) in vec3 aPosition;
layout (location = 1) in vec3 aNormal;
layout (location = 2) in vec2 aUv;

in uvec4 aBoneIndex;
in vec4 aWeight;

out vec3 Normal;
out vec2 Uv;
out vec3 FragPosition;

uniform mat4 projection;
uniform mat4 model;
uniform mat4 view;
uniform mat4 normal;

uniform sampler2D boneMatrixTexture;
uniform float numBones;

mat4 getBoneMatrix( uint boneNdx ) {
    return mat4(
      texelFetch( boneMatrixTexture, ivec2( 0, boneNdx ), 0 ),
      texelFetch( boneMatrixTexture, ivec2( 1, boneNdx ), 0 ),
      texelFetch( boneMatrixTexture, ivec2( 2, boneNdx ), 0 ),
      texelFetch( boneMatrixTexture, ivec2( 3, boneNdx ), 0 ));
}


void main()
{
    Uv = aUv;

    Normal = aNormal;

    FragPosition = vec3( model * vec4( aPosition, 1.0 ) );

    vec4 transformed = vec4( aPosition, 1.0 );

    gl_Position = projection * view *
                  (getBoneMatrix( aBoneIndex[ 0 ] ) * transformed * aWeight[ 0 ] +
                   getBoneMatrix( aBoneIndex[ 1 ] ) * transformed * aWeight[ 1 ] +
                   getBoneMatrix( aBoneIndex[ 2 ] ) * transformed * aWeight[ 2 ] +
                   getBoneMatrix( aBoneIndex[ 3 ] ) * transformed * aWeight[ 3 ]);

}