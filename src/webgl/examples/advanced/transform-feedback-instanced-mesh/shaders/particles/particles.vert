#version 300 es

precision highp float;

layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec3 aOffset;
layout(location = 2) in vec3 aNormal;
layout(location = 3) in vec2 aUv;

out vec3 Normal;
out vec2 Uv;

uniform mat4 projection;
uniform mat4 model;
uniform mat4 view;

void main() {

    Normal = aNormal;

    Uv = aUv;

    vec3 pos = aPosition;

    mat4 modelView = model * view;

    // modelView[0][0] = 1.;  // 0
    // modelView[0][1] = 0.;  // 1
    // modelView[0][2] = 0.;  // 2

    // // Column 1:
    // modelView[1][0] = 0.;  // 4
    // modelView[1][1] = 1.; // 5
    // modelView[1][2] = 0.;  // 6

    // // Column 2:
    // modelView[2][0] = 0.;  // 8
    // modelView[2][1] = 0.;  // 9
    // modelView[2][2] = 1.;  // 10

    vec4 mvPosition = modelView * vec4(pos + (aOffset), 1.0);

    gl_Position = projection * mvPosition;
}