import * as THREE from "three";

export default class PlanckEffect {
  constructor(opts = {}) {
    this.appendages = [];
    this.group = null;
    this.cube = null;
    this._apMaterial = null;
    this._sharedDisp = null;
    this._sharedTime = null;
  }

  init(scene, cube) {
    this.cube = cube;

    if (!cube.material.uniforms) cube.material.uniforms = {};
    if (!cube.material.uniforms.u_enablePlanckGradient)
      cube.material.uniforms.u_enablePlanckGradient = { value: 0.0 };

    cube.material.uniforms.u_enablePlanckGradient.value = 1.0;

    this._sharedDisp = cube.material.uniforms.u_disp || { value: 0.0 };
    this._sharedTime = cube.material.uniforms.u_time || { value: 0.0 };

    this._apMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        precision highp float;
        uniform float u_time;
        uniform float u_disp;
        varying vec3 vWorldPos;
        varying vec3 vNormal;

        float snoise(vec3 p){
          return fract(sin(dot(p, vec3(12.9898,78.233,45.164))) * 43758.5453) * 2.0 - 1.0;
        }

        void main(){
          vec3 worldPos = (modelMatrix * vec4(position, 1.0)).xyz;
          vWorldPos = worldPos;

          vNormal = normalize(mat3(modelMatrix) * normal);

          float n = snoise(position * 4.0 + u_time * 0.6);
          vec3 displaced = position + normal * n * u_disp * 0.6;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;
        varying vec3 vWorldPos;
        varying vec3 vNormal;
        uniform float u_time;

        const vec3 P0 = vec3(0.0, 0.0, 0.0);
        const vec3 P1 = vec3(0.09411765, 0.0, 0.67843137); // #1800ad
        const vec3 P2 = vec3(1.0, 0.19215686, 0.19215686); // #ff3131
        const vec3 P3 = vec3(1.0, 0.45882353, 0.12156863); // #ff751f
        const vec3 P4 = vec3(1.0, 0.86666667, 0.34901961); // #ffde59
        const vec3 P5 = vec3(1.0, 1.0, 1.0);

        vec3 paletteMap(float r) {
          float maxR = 3.0;
          float t = clamp(r / maxR, 0.0, 1.0) * 5.0; 
          float idx = floor(t);
          float f = fract(t);

          if (idx < 0.5) return mix(P0, P1, f);
          else if (idx < 1.5) return mix(P1, P2, f);
          else if (idx < 2.5) return mix(P2, P3, f);
          else if (idx < 3.5) return mix(P3, P4, f);
          else return mix(P4, P5, f);
        }

        void main(){
          float r = length(vWorldPos);
          vec3 col = paletteMap(r);

          float fres = pow(1.0 - abs(dot(normalize(vNormal), vec3(0.0,0.0,1.0))), 2.0);
          float alpha = 1.0 - smoothstep(3.0, 3.6, r) ;
          alpha *= 0.85 + fres * 0.4;

          gl_FragColor = vec4(col, alpha);
        }
      `,
      transparent: true,
      depthWrite: false
    });

    this.group = new THREE.Group();
    this.cube.add(this.group);

    const APP_COUNT = 350;
    const GEOMETRIES = [
      new THREE.TetrahedronGeometry(0.08),
      new THREE.BoxGeometry(0.09, 0.09, 0.09),
      new THREE.OctahedronGeometry(0.075),
      new THREE.IcosahedronGeometry(0.06)
    ];

    for (let i = 0; i < APP_COUNT; i++) {
      const geom = GEOMETRIES[Math.floor(Math.random() * GEOMETRIES.length)].clone();

      const mesh = new THREE.Mesh(geom, this._apMaterial);

      const dir = new THREE.Vector3(
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        Math.random() * 2 - 1
      ).normalize();

      const baseDist = 0.5 + Math.random() * 0.6; 
      const jitter = (Math.random() - 0.5) * 0.25;

      mesh.position.copy(dir.clone().multiplyScalar(baseDist + jitter));

      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      const s = 0.6 + Math.random() * 1.4;
      mesh.scale.set(s, s, s);

      mesh.orbitAxis = new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize();
      mesh.orbitSpeed = 0.05 + Math.random() * 0.25;

      mesh._baseRadius = mesh.position.length();

      this.appendages.push(mesh);
      this.group.add(mesh);
    }

    this._apMaterial.uniforms = {
      u_time: this._sharedTime,
      u_disp: this._sharedDisp
    };
  }

  update(dt, t) {
    for (const a of this.appendages) {
      a.position.applyAxisAngle(a.orbitAxis, dt * a.orbitSpeed);

      const disp = (this._sharedDisp?.value ?? 0.0);
      const pulse = 1.0 + Math.sin((t + a._baseRadius) * 3.0) * 0.08 * (1.0 + disp * 3.0);

      a.scale.set(pulse * a.scale.x, pulse * a.scale.y, pulse * a.scale.z); 
    }
  }

  dispose(scene, cube) {
    if (cube?.material?.uniforms?.u_enablePlanckGradient)
      cube.material.uniforms.u_enablePlanckGradient.value = 0.0;

    if (this.group && cube) {
      cube.remove(this.group);
      this.group.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
      });
      if (this._apMaterial) this._apMaterial.dispose();
    }
    this.appendages.length = 0;
    this.group = null;
    this._apMaterial = null;
  }
}
