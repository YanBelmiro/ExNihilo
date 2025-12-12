import * as THREE from "three";

export default class DarkEffect {

  constructor(opts = {}) {
    this.count = opts.count ?? 1800;

    this.radiusMax = opts.radiusMax ?? 8.0;
    this.minDist = opts.minDist ?? 0.08;   
    this.G = opts.G ?? 0.015;              
    this.maxSpeed = opts.maxSpeed ?? 0.6;

    this.scale = opts.scale ?? 0.045;

    this.baseOpacity = opts.baseOpacity ?? 0.15;
    this.maxOpacity = opts.maxOpacity ?? 0.45;

    this.neighborCount = opts.neighborCount ?? 5; 

    this.group = null;
    this.sprites = [];
    this.vel = [];
  }

  init(scene, cube) {
    this.scene = scene;
    this.cube = cube;

    this.group = new THREE.Group();
    cube.add(this.group);

    const uA = cube.material.uniforms?.u_colorA?.value.clone() ?? new THREE.Color("#888888");
    const uB = cube.material.uniforms?.u_colorB?.value.clone() ?? new THREE.Color("#bbbbbb");
    const baseColor = uA.clone().lerp(uB, 0.3);

    for (let i = 0; i < this.count; i++) {
      const mat = new THREE.SpriteMaterial({
        color: baseColor.clone(),
        transparent: true,
        opacity: this.baseOpacity,
        depthWrite: false
      });

      const sp = new THREE.Sprite(mat);
      sp.scale.set(this.scale, this.scale, this.scale);

      const dir = new THREE.Vector3(
        Math.random()*2-1,
        Math.random()*2-1,
        Math.random()*2-1
      ).normalize();

      const r = Math.random() * this.radiusMax;

      sp.position.copy(dir.multiplyScalar(r));
      this.group.add(sp);

      this.sprites.push(sp);

      this.vel.push(new THREE.Vector3(
        (Math.random()-0.5)*0.02,
        (Math.random()-0.5)*0.02,
        (Math.random()-0.5)*0.02
      ));
    }
  }

  update(dt, t) {
    if (!this.group) return;

    const N = this.sprites.length;

    for (let i = 0; i < N; i++) {
      const si = this.sprites[i];
      const vi = this.vel[i];

      let density = 0;

      for (let k = 0; k < this.neighborCount; k++) {
        const j = Math.floor(Math.random() * N);
        if (j === i) continue;

        const sj = this.sprites[j];

        const dir = sj.position.clone().sub(si.position);
        const dist = dir.length();

        if (dist < 0.0001) continue;

        if (dist < 0.35) density++;

        if (dist < this.minDist) {
          vi.add(dir.normalize().multiplyScalar(-0.02));
        } else {
          const force = (this.G * dt) / (dist * dist);
          vi.add(dir.normalize().multiplyScalar(force));
        }
      }

      if (vi.length() > this.maxSpeed) {
        vi.normalize().multiplyScalar(this.maxSpeed);
      }
      si.position.addScaledVector(vi, dt);

      si.position.multiplyScalar(1 - dt * 0.02);

      const f = density / this.neighborCount;
      si.material.opacity = THREE.MathUtils.lerp(
        si.material.opacity,
        this.baseOpacity + f * (this.maxOpacity - this.baseOpacity),
        dt * 4.0
      );
    }
  }

  dispose() {
    if (!this.group) return;
    this.cube.remove(this.group);
    this.group.traverse(o => o.material?.dispose());
    this.group = null;
    this.sprites.length = 0;
    this.vel.length = 0;
  }
}
