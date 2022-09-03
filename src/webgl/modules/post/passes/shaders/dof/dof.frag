#version 300 es

precision highp float;

uniform sampler2D map;
uniform sampler2D depthMap;

uniform float maxBlur;  // max blur amount
uniform float aperture; // aperture - bigger values for shallower depth of field

uniform float focus;
uniform float aspect;

in vec2 Uv;
out vec4 FragColor;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(41, 289))) * 45758.5453);
}

void main() {

    vec2 aspectcorrect = vec2(1.0, aspect);

    float depth = texture(depthMap, Uv).r;

    float factor = smoothstep(0.0, 0.3, depth - focus);

    vec2 dofblur = vec2(clamp(factor * aperture, -maxBlur, maxBlur));

    vec2 dofblur9 = dofblur * 0.9;
    vec2 dofblur7 = dofblur * 0.7;
    vec2 dofblur4 = dofblur * 0.4;

    vec3 col = vec3(0.0);

    vec2 st = Uv;

    col += texture(map, st.xy).rgb;
    col += texture(map, st.xy + (vec2(0.0, 0.4) * aspectcorrect) * dofblur).rgb;
    col += texture(map, st.xy + (vec2(0.15, 0.37) * aspectcorrect) * dofblur).rgb;
    col += texture(map, st.xy + (vec2(0.29, 0.29) * aspectcorrect) * dofblur).rgb;
    col += texture(map, st.xy + (vec2(-0.37, 0.15) * aspectcorrect) * dofblur).rgb;
    col += texture(map, st.xy + (vec2(0.40, 0.0) * aspectcorrect) * dofblur).rgb;
    col += texture(map, st.xy + (vec2(0.37, -0.15) * aspectcorrect) * dofblur).rgb;
    col += texture(map, st.xy + (vec2(0.29, -0.29) * aspectcorrect) * dofblur).rgb;
    col += texture(map, st.xy + (vec2(-0.15, -0.37) * aspectcorrect) * dofblur).rgb;
    col += texture(map, st.xy + (vec2(0.0, -0.4) * aspectcorrect) * dofblur).rgb;
    col += texture(map, st.xy + (vec2(-0.15, 0.37) * aspectcorrect) * dofblur).rgb;
    col += texture(map, st.xy + (vec2(-0.29, 0.29) * aspectcorrect) * dofblur).rgb;
    col += texture(map, st.xy + (vec2(0.37, 0.15) * aspectcorrect) * dofblur).rgb;
    col += texture(map, st.xy + (vec2(-0.4, 0.0) * aspectcorrect) * dofblur).rgb;
    col += texture(map, st.xy + (vec2(-0.37, -0.15) * aspectcorrect) * dofblur).rgb;
    col += texture(map, st.xy + (vec2(-0.29, -0.29) * aspectcorrect) * dofblur).rgb;
    col += texture(map, st.xy + (vec2(0.15, -0.37) * aspectcorrect) * dofblur).rgb;

    col += texture(map, st.xy + (vec2(0.15, 0.37) * aspectcorrect) * dofblur9).rgb;
    col += texture(map, st.xy + (vec2(-0.37, 0.15) * aspectcorrect) * dofblur9).rgb;
    col += texture(map, st.xy + (vec2(0.37, -0.15) * aspectcorrect) * dofblur9).rgb;
    col += texture(map, st.xy + (vec2(-0.15, -0.37) * aspectcorrect) * dofblur9).rgb;
    col += texture(map, st.xy + (vec2(-0.15, 0.37) * aspectcorrect) * dofblur9).rgb;
    col += texture(map, st.xy + (vec2(0.37, 0.15) * aspectcorrect) * dofblur9).rgb;
    col += texture(map, st.xy + (vec2(-0.37, -0.15) * aspectcorrect) * dofblur9).rgb;
    col += texture(map, st.xy + (vec2(0.15, -0.37) * aspectcorrect) * dofblur9).rgb;

    col += texture(map, st.xy + (vec2(0.29, 0.29) * aspectcorrect) * dofblur7).rgb;
    col += texture(map, st.xy + (vec2(0.40, 0.0) * aspectcorrect) * dofblur7).rgb;
    col += texture(map, st.xy + (vec2(0.29, -0.29) * aspectcorrect) * dofblur7).rgb;
    col += texture(map, st.xy + (vec2(0.0, -0.4) * aspectcorrect) * dofblur7).rgb;
    col += texture(map, st.xy + (vec2(-0.29, 0.29) * aspectcorrect) * dofblur7).rgb;
    col += texture(map, st.xy + (vec2(-0.4, 0.0) * aspectcorrect) * dofblur7).rgb;
    col += texture(map, st.xy + (vec2(-0.29, -0.29) * aspectcorrect) * dofblur7).rgb;
    col += texture(map, st.xy + (vec2(0.0, 0.4) * aspectcorrect) * dofblur7).rgb;

    col += texture(map, st.xy + (vec2(0.29, 0.29) * aspectcorrect) * dofblur4).rgb;
    col += texture(map, st.xy + (vec2(0.4, 0.0) * aspectcorrect) * dofblur4).rgb;
    col += texture(map, st.xy + (vec2(0.29, -0.29) * aspectcorrect) * dofblur4).rgb;
    col += texture(map, st.xy + (vec2(0.0, -0.4) * aspectcorrect) * dofblur4).rgb;
    col += texture(map, st.xy + (vec2(-0.29, 0.29) * aspectcorrect) * dofblur4).rgb;
    col += texture(map, st.xy + (vec2(-0.4, 0.0) * aspectcorrect) * dofblur4).rgb;
    col += texture(map, st.xy + (vec2(-0.29, -0.29) * aspectcorrect) * dofblur4).rgb;
    col += texture(map, st.xy + (vec2(0.0, 0.4) * aspectcorrect) * dofblur4).rgb;

    FragColor.rgb = col / 41.0;
    //FragColor.rgb = vec3( factor );
    FragColor.a = 1.0;

}