precision mediump float;

varying vec3 vPos;
uniform float u_time;
uniform float u_intensity;

float noise3d(vec3 p);

void main() {
    vec3 dir = normalize(vPos);
    float n = abs(noise3d(dir * 3.0 + u_time * 0.05));

    n = pow(n, 1.25);
    n = clamp(n, 0.0, 1.0);

    float c = n * u_intensity;

    gl_FragColor = vec4(vec3(c), 1.0);
}
