precision highp float;

varying vec3 vPos;
varying vec3 vNormal;

uniform float u_time;
uniform float u_mix;
uniform float u_disp;

uniform vec3 u_tint;
uniform float u_emissive;
uniform float u_showPlanck;
uniform float u_showPairs;
uniform float u_showOrbits;
uniform float u_pointDensity;

uniform vec3 u_colorA;
uniform vec3 u_colorB;

float noise3d(vec3 p);

float hash(vec3 p){
    return fract(sin(dot(p, vec3(12.9898,78.233,45.164))) * 43758.5453);
}

void main() {
    vec3 col = vec3(0.0);

    float base = abs(noise3d(vPos * 3.0 + u_time * 0.05));
    base = pow(base, 1.3);          
    base = clamp(base, 0.0, 1.0);

    col += mix(vec3(0.02), u_tint, 0.6) * base;

    if (u_showPlanck > 0.5) {
        float n = abs(noise3d(vPos * 8.0 + u_time * 0.6));
        float peaks = smoothstep(0.82, 1.0, n);
        col += mix(u_colorA, u_colorB, n) * peaks * 1.2;
    }


    if (u_showPairs > 0.5) {
        float p = abs(noise3d(vPos * 5.0 - u_time * 0.9));
        float pair = smoothstep(0.78, 1.0, p);
        col += mix(u_colorB, u_colorA, fract(p * 12.3)) * pair * 0.9;
    }


    if (u_showOrbits > 0.0) {
        float r = length(vPos.xy);
        float rings = 0.5 + 0.5 * sin((r - u_time * 0.22) * 40.0);
        rings = smoothstep(0.55, 0.83, rings);
        col += u_colorA * rings * u_showOrbits;
    }


    if (u_pointDensity > 0.0) {
        float h = hash(vPos);
        float s = step(1.0 - u_pointDensity, h);
        col += vec3(s) * 1.0;
    }


    col = clamp(col, 0.0, 1.0);
    col = mix(vec3(0.0), col, u_mix);
    col = mix(col, u_tint, u_emissive);
    
    gl_FragColor = vec4(col, 1.0);
}
