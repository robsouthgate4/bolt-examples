#version 300 es

precision highp float;

layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec2 aUv;

layout(location = 5) in vec4 aJoints;
layout(location = 6) in vec4 aWeights;

out vec3 Normal;
out vec2 Uv;
out vec3 Weights;

uniform mat4 projection;
uniform mat4 model;
uniform mat4 view;
uniform mat4 normal;

uniform sampler2D jointTexture;

uniform float jointCount;

#define ROW0_U ((0.5 + 0.0) / 4.)
#define ROW1_U ((0.5 + 1.0) / 4.)
#define ROW2_U ((0.5 + 2.0) / 4.)
#define ROW3_U ((0.5 + 3.0) / 4.)

mat4 getBoneMatrix(float jointIndex) {

  float v = (jointIndex + 0.5) / jointCount;

  return mat4(texture(jointTexture, vec2(ROW0_U, v)), texture(jointTexture, vec2(ROW1_U, v)), texture(jointTexture, vec2(ROW2_U, v)), texture(jointTexture, vec2(ROW3_U, v)));

}

void main() {

  Uv = aUv;
  Normal = aNormal;
  Normal = aJoints.xyz / (jointCount - 1.0);
  Normal = aWeights.xyz;

  mat4 skinMatrix = mat4(1.0);

  skinMatrix = getBoneMatrix(aJoints[0]) * aWeights[0] +
    getBoneMatrix(aJoints[1]) * aWeights[1] +
    getBoneMatrix(aJoints[2]) * aWeights[2] +
    getBoneMatrix(aJoints[3]) * aWeights[3];

  mat4 combinedModel = model * skinMatrix;

  gl_Position = projection * view * combinedModel * vec4(aPosition, 1.0);
}