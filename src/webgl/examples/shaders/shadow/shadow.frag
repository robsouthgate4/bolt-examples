#version 300 es

void main() {

    gl_FragColor = vec4(vec3(gl_FragCoord.z), 1.0);

}