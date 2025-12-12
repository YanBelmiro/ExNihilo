import * as THREE from "three";

export default class CubeEngine {
  constructor({ scene, camera, renderer, shaders }) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.shaders = shaders;

    this.cube = null;
    this.sky = null;

    this.cubeMaterial = null;
    this.skyMaterial = null;

    this.currentEffect = null;
    this.transitioning = false;

    this.uniforms = {
      u_time: { value: 0 },
      u_mix: { value: 1.0 }
    };

    this.defaultUniforms = {
      u_disp:        { value: 0.0 },
      u_tint:        { value: new THREE.Color("#ffffff") },
      u_emissive:    { value: 0.5 },

      u_showPlanck:  { value: 0.0 },
      u_showPairs:   { value: 0.0 },
      u_showOrbits:  { value: 0.0 },
      u_pointDensity:{ value: 0.0 },

      u_colorA:      { value: new THREE.Color("#000000") },
      u_colorB:      { value: new THREE.Color("#ffffff") }
    };

    this.autoRotate = { x: 0, y: 0, z: 0 };

    this.size = 1.0;
  }

  async init() {
    const skyGeo = new THREE.SphereGeometry(40, 32, 16);

    this.skyMaterial = new THREE.ShaderMaterial({
      vertexShader: `varying vec3 vPos; void main(){ vPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: this.shaders.sky,
      uniforms: {
        u_time: { value: 0 },
        u_intensity: { value: 0.12 }
      },
      side: THREE.BackSide,
      depthWrite: false,
      transparent: true
    });

    this.sky = new THREE.Mesh(skyGeo, this.skyMaterial);
    this.scene.add(this.sky);

    const geo = new THREE.BoxGeometry(this.size, this.size, this.size, 32, 32, 32);

    const baseUniforms = {};
    for (const k in this.defaultUniforms) {
      const v = this.defaultUniforms[k].value;
      baseUniforms[k] = (v instanceof THREE.Color)
        ? { value: v.clone() }
        : { value: v };
    }

    baseUniforms.u_time = this.uniforms.u_time;
    baseUniforms.u_mix  = this.uniforms.u_mix;

    this.cubeMaterial = new THREE.ShaderMaterial({
      vertexShader: this.shaders.cubeVertex,
      fragmentShader: this.shaders.cubeBaseFrag,
      uniforms: baseUniforms,
      side: THREE.DoubleSide
    });

    this.cube = new THREE.Mesh(geo, this.cubeMaterial);
    this.scene.add(this.cube);
  }

  async setSky(uniforms = {}) {
    for (const k in uniforms) {
      const val = uniforms[k];

      if (this.skyMaterial.uniforms[k] !== undefined) {
        if (typeof val === "string" && val.startsWith("#"))
          this.skyMaterial.uniforms[k].value = new THREE.Color(val);
        else
          this.skyMaterial.uniforms[k].value = val;
      } else {
        this.skyMaterial.uniforms[k] = {
          value: (typeof val === "string" && val.startsWith("#"))
            ? new THREE.Color(val)
            : val
        };
      }
    }
  }

  setCubeScale(scale) {
    if (!this.cube) return;
    this.cube.scale.set(scale, scale, scale);
  }

  setCubeRotation(x, y, z) {
    if (!this.cube) return;
    this.cube.rotation.set(x, y, z);
  }

  setCubeAutoRotate(x = 0, y = 0, z = 0) {
    this.autoRotate = { x, y, z };
  }

  async setCubeConfig({ shaderName = "base", uniforms = {}, scale, rotation, autoRotate } = {}) {

    for (const k in uniforms) {
      const val = uniforms[k];

      if (this.cubeMaterial.uniforms[k] !== undefined) {
        if (this.cubeMaterial.uniforms[k].value instanceof THREE.Color)
          this.cubeMaterial.uniforms[k].value.set(val);
        else
          this.cubeMaterial.uniforms[k].value = val;
      } else {
        this.cubeMaterial.uniforms[k] = {
          value: (typeof val === "string" && val.startsWith("#"))
            ? new THREE.Color(val)
            : val
        };
      }
    }

    for (const k in this.defaultUniforms) {
      if (uniforms[k] === undefined) {
        const def = this.defaultUniforms[k].value;

        if (!this.cubeMaterial.uniforms[k])
          this.cubeMaterial.uniforms[k] = {};

        if (def instanceof THREE.Color)
          this.cubeMaterial.uniforms[k].value = def.clone();
        else
          this.cubeMaterial.uniforms[k].value = def;
      }
    }

    if (scale !== undefined) this.setCubeScale(scale);

    if (rotation !== undefined)
      this.setCubeRotation(rotation[0], rotation[1], rotation[2]);

    if (autoRotate !== undefined)
      this.setCubeAutoRotate(autoRotate[0], autoRotate[1], autoRotate[2]);

    this.uniforms.u_mix.value = 0.0;

    this.cubeMaterial.uniformsNeedUpdate = true;
  }

  setEffect(effect) {
    if (this.currentEffect?.dispose)
      this.currentEffect.dispose(this.scene, this.cube);

    this.currentEffect = effect;

    if (this.currentEffect?.init)
      this.currentEffect.init(this.scene, this.cube);
  }

  getCube() { 
    return this.cube; 
  }

  onResize(w, h) {}

  transitionTo(targetMix = 1.0, { duration = 1.0 } = {}) {
    if (this.transitioning) return Promise.resolve();
    this.transitioning = true;

    const start = performance.now();
    const from = this.uniforms.u_mix.value;

    return new Promise(resolve => {
      const step = now => {
        const t = Math.min(1, (now - start) / (duration * 1000));
        const eased = 1 - Math.pow(1 - t, 3);
        this.uniforms.u_mix.value = THREE.MathUtils.lerp(from, targetMix, eased);

        if (t < 1) requestAnimationFrame(step);
        else {
          this.transitioning = false;
          resolve();
        }
      };

      requestAnimationFrame(step);
    });
  }

  update(dt, t) {
    this.uniforms.u_time.value = t;

    if (this.skyMaterial?.uniforms?.u_time)
      this.skyMaterial.uniforms.u_time.value = t;

    if (this.autoRotate) {
      if (this.cube) {
        this.cube.rotation.x += this.autoRotate.x * dt;
        this.cube.rotation.y += this.autoRotate.y * dt;
        this.cube.rotation.z += this.autoRotate.z * dt;
      }
    }

    if (this.currentEffect?.update)
      this.currentEffect.update(dt, t, this.cube, this);
  }

  dispose() {
    if (this.cube) {
      this.scene.remove(this.cube);
      this.cube.geometry.dispose();
      this.cube.material.dispose();
      this.cube = null;
    }

    if (this.sky) {
      this.scene.remove(this.sky);
      this.sky.geometry.dispose();
      this.sky.material.dispose();
      this.sky = null;
    }

    if (this.currentEffect?.dispose)
      this.currentEffect.dispose(this.scene, this.cube);

    this.currentEffect = null;
  }
}
