import * as THREE from "three";

export default class GreatUnificationEffect {

  constructor(opts = {}) {
    this.layers = opts.layers ?? 64;
    this.perLayer = opts.perLayer ?? 200;

    this.radiusMin = opts.radiusMin ?? 1.2;
    this.radiusMax = opts.radiusMax ?? 30;

    this.pulseSpeed = opts.pulseSpeed ?? 10.0;
    this.pulseAmp   = opts.pulseAmp   ?? 0.04;

    this.flashChance = opts.flashChance ?? 0.004;

    this.sprites = [];
  }

  init(scene, cube) {
    this.scene = scene;
    this.cube = cube;

    this.group = new THREE.Group();
    cube.add(this.group);

    const colA = cube.material.uniforms?.u_colorA?.value.clone() ?? new THREE.Color("#1800ad");
    const colB = cube.material.uniforms?.u_colorB?.value.clone() ?? new THREE.Color("#ff751f");

    this.colA = colA;
    this.colB = colB;

    const maxLayers = this.layers;
    const per = this.perLayer;

    const fib = (n) => {
      const res = [];
      const golden = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < n; i++) {
        const y = 1 - (i / (n - 1)) * 2;
        const r = Math.sqrt(1 - y*y);
        const theta = golden * i;
        res.push(new THREE.Vector3(Math.cos(theta)*r, y, Math.sin(theta)*r));
      }
      return res;
    };

    for (let s = 0; s < maxLayers; s++) {
      const frac = s / (maxLayers - 1);
      const radius = THREE.MathUtils.lerp(this.radiusMin, this.radiusMax, frac);

      const baseColor = this.colA.clone().lerp(this.colB, frac);

      const layerDirs = fib(per);

      for (let i = 0; i < per; i++) {
        const dir = layerDirs[i].clone();

        const mat = new THREE.SpriteMaterial({
          color: baseColor.clone(),
          transparent: true,
          opacity: 0.88,
          depthWrite: false
        });

        const sp = new THREE.Sprite(mat);
        sp._dir = dir.clone();
        sp._baseRadius = radius;
        sp._radius = radius;

        sp.position.copy(dir.clone().multiplyScalar(radius));
        sp.scale.set(0.065, 0.065, 0.065);

        this.group.add(sp);
        this.sprites.push(sp);
      }
    }

    this.flashes = [];
    for (let i = 0; i < 40; i++) {
      const m = new THREE.SpriteMaterial({
        color: new THREE.Color("#ffffff"),
        transparent: true,
        opacity: 0
      });
      const f = new THREE.Sprite(m);
      f.scale.set(0.08, 0.08, 0.08);
      f.visible = false;
      this.group.add(f);
      this.flashes.push(f);
    }
  }

  spawnFlash(pos) {
    for (const f of this.flashes) {
      if (!f.visible) {
        f.visible = true;
        f.position.copy(pos);
        f.material.opacity = 1;
        f._life = 0.15;
        return;
      }
    }
  }

  update(dt, t) {

    const pulse = 1 + Math.sin(t * this.pulseSpeed) * this.pulseAmp;

    for (const sp of this.sprites) {

      const r = sp._baseRadius * pulse;
      sp.position.copy(sp._dir).multiplyScalar(r);

      const frac = (sp._baseRadius - this.radiusMin) / (this.radiusMax - this.radiusMin);
      sp.material.color.copy(this.colA).lerp(this.colB, frac);

      if (Math.random() < this.flashChance) {
        this.spawnFlash(sp.position);
      }
    }

    for (const f of this.flashes) {
      if (!f.visible) continue;
      f._life -= dt;
      f.material.opacity = Math.max(0, f._life * 6);
      if (f._life <= 0) f.visible = false;
    }
  }

  dispose() {
    if (this.group && this.cube) {
      this.cube.remove(this.group);
      this.group.traverse(o => {
        if (o.material) o.material.dispose();
      });
    }
    this.sprites.length = 0;
    this.flashes.length = 0;
  }
}
