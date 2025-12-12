precision highp float;

varying vec3 vPos;
varying vec3 vNormal;

uniform float u_time;
uniform float u_disp;

float noise3d(vec3 p);

void main(){
    vPos = position;
    vNormal = normal;

    vec3 p = position * 2.0 + vec3(u_time * 0.12);

    float n = 0.0;
    n += noise3d(p * 0.8) * 0.6;
    n += noise3d(p * 2.1) * 0.25;
    n += noise3d(p * 4.4) * 0.12;

    vec3 displaced = position + normal * n * u_disp;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
