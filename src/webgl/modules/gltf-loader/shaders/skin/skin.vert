#version 300 es

precision highp float;

layout (location = 0) in vec3 aPosition;
layout (location = 1) in vec3 aNormal;
layout (location = 2) in vec2 aUv;

in vec4 aJoints;
in vec4 aWeights;


out vec3 Normal;
out vec2 Uv;
out vec3 Weights;

uniform mat4 projection;
uniform mat4 model;
uniform mat4 view;
uniform mat4 normal;

uniform sampler2D jointTexture;
uniform mat4 jointTransforms[25];
uniform float jointCount;

#define ROW0_U ((0.5 + 0.0) / 4.)
#define ROW1_U ((0.5 + 1.0) / 4.)
#define ROW2_U ((0.5 + 2.0) / 4.)
#define ROW3_U ((0.5 + 3.0) / 4.)

// mat4 getBoneMatrix( float jointIndex ) {

//   float v = ( jointIndex + 0.5 ) / jointCount;

//   return mat4(
//     texture( jointTexture, vec2( ROW0_U, v ) ),
//     texture( jointTexture, vec2( ROW1_U, v ) ),
//     texture( jointTexture, vec2( ROW2_U, v ) ),
//     texture( jointTexture, vec2( ROW3_U, v ) )
//   );

// }

// mat4 getBoneMatrix( uint jointIndex  ) {

//   return mat4(
//     texelFetch( jointTexture, ivec2( 0, jointIndex ), 0 ),
//     texelFetch( jointTexture, ivec2( 1, jointIndex ), 0 ),
//     texelFetch( jointTexture, ivec2( 2, jointIndex ), 0 ),
//     texelFetch( jointTexture, ivec2( 3, jointIndex ), 0 ) );

// }

void main()
{

  Uv = aUv;
  Normal = aNormal;
  Normal = aJoints.xyz / ( jointCount - 1.0 );
  //Normal = aWeights.xyz;

  mat4 skinMatrix = mat4( 1.0 );

  skinMatrix = jointTransforms[ int( aJoints.x ) ] * aWeights.x +
                    jointTransforms[ int( aJoints.y ) ] * aWeights.y +
                    jointTransforms[ int( aJoints.z ) ] * aWeights.z +
                    jointTransforms[ int( aJoints.w ) ] * aWeights.w;

  mat4 combinedModel = model * skinMatrix;

  gl_Position = projection * view * combinedModel * vec4( aPosition, 1.0 );
}