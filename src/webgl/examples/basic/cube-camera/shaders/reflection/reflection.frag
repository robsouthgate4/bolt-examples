#version 300 es

precision highp float;

uniform vec3 viewPosition;
uniform samplerCube mapReflection;
uniform mat4 projection;
uniform vec3 cameraPosition;

out vec4 FragColor;

in vec2 Uv;
in vec3 Normal;
in vec3 Position;

uniform vec4 baseColor;

void main() {

    vec3 I = normalize(Position - cameraPosition);

    vec3 reflected = reflect(I, normalize(Normal));

    vec3 color = texture(mapReflection, reflected).rgb;

    FragColor = vec4(color, 1.0);

}