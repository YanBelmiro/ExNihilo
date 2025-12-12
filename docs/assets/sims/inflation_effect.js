import * as THREE from "three";

export default class InflationEffect {

  constructor(opts = {}) {

    this.layers      = opts.layers      ?? 28;   
    this.perLayer    = opts.perLayer    ?? 200;   

    this.radiusMin   = opts.radiusMin   ?? 1.2;
    this.radiusMax   = opts.radiusMax   ?? 6;

    this.radialSpeed = opts.radialSpeed ?? 0.35;

    this.pulseSpeed  = opts.pulseSpeed  ?? 1.8;
    this.pulseAmp    = opts.pulseAmp    ?? 6.03;

    this.bandCount   = opts.bandCount   ?? 6;

    this.fastInterval = opts.fastInterval ?? 2.2;
    this.fastSpeed    = opts.fastSpeed    ?? 18.0;
    this.fastSize     = opts.fastSize     ?? 0.28;

    this.flashChance = opts.flashChance ?? 0.0008;

    this.returnSpeed = opts.returnSpeed ?? 5.0;

    this.sprites = [];
    this.fast    = [];
    this.flashes = [];

    this._timer = 0;
  }

  fibonacciSphere(n) {
    const pts = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2;
      const r = Math.sqrt(1 - y*y);
      const theta = golden * i;
      pts.push(new THREE.Vector3(Math.cos(theta)*r, y, Math.sin(theta)*r));
    }
    return pts;
  }

  init(scene, cube) {
    this.scene = scene;
    this.cube  = cube;

    this.group = new THREE.Group();
    cube.add(this.group);

    const uA = cube.material.uniforms?.u_colorA?.value.clone() ?? new THREE.Color("#1800ad");
    const uB = cube.material.uniforms?.u_colorB?.value.clone() ?? new THREE.Color("#ff751f");

    this.colorA = uA;
    this.colorB = uB;

    const layers = this.layers;
    const per    = this.perLayer;

    for (let s = 0; s < layers; s++) {

      const frac   = s / (layers - 1);
      const radius = THREE.MathUtils.lerp(this.radiusMin, this.radiusMax, frac);

      const bandIndex = Math.floor(frac * this.bandCount) / (this.bandCount - 1);
      const baseColor = this.colorA.clone().lerp(this.colorB, bandIndex);

      const dirs = this.fibonacciSphere(per);

      for (let i = 0; i < per; i++) {

        const dir = dirs[i].clone();

        const mat = new THREE.SpriteMaterial({
          color: baseColor.clone(),
          transparent: true,
          opacity: 0.9
        });

        const sp = new THREE.Sprite(mat);
        sp._dir = dir.clone();

        sp._baseRadius = radius;
        sp._radius     = radius;
        sp._offset     = new THREE.Vector3();

        sp.position.copy(dir).multiplyScalar(radius);
        sp.scale.set(0.06, 0.06, 0.06);

        this.group.add(sp);
        this.sprites.push(sp);
      }
    }

    for (let i = 0; i < 40; i++) {
      const mat = new THREE.SpriteMaterial({
        color: new THREE.Color("#ffffff"),
        transparent: true,
        opacity: 0
      });
      const fl = new THREE.Sprite(mat);
      fl.scale.set(0.08, 0.08, 0.08);
      fl.visible = false;
      this.group.add(fl);
      this.flashes.push(fl);
    }
  }

  spawnFlash(pos) {
    for (const fl of this.flashes) {
      if (!fl.visible) {
        fl.visible = true;
        fl.position.copy(pos);
        fl.material.opacity = 1;
        fl._life = 0.15;
        return;
      }
    }
  }

  spawnFast() {

    const mat = new THREE.SpriteMaterial({
      color: new THREE.Color("#ffffff"),
      transparent: true,
      opacity: 1
    });

    const sp = new THREE.Sprite(mat);
    sp.scale.set(this.fastSize, this.fastSize, this.fastSize);

    const dir = new THREE.Vector3(
      Math.random()*2 -1,
      Math.random()*2 -1,
      Math.random()*2 -1
    ).normalize();

    sp.position.copy(dir).multiplyScalar(this.radiusMax + 12);
    sp._vel = dir.clone().multiplyScalar(-this.fastSpeed);
    sp._life = (this.radiusMax*2 + 30) / this.fastSpeed;

    this.fast.push(sp);
    this.group.add(sp);
  }

  update(dt, t) {

    const pulse = 1 + Math.sin(t * this.pulseSpeed) * this.pulseAmp;

    for (const sp of this.sprites) {

      sp._radius += dt * this.radialSpeed;
      if (sp._radius > this.radiusMax) {
        sp._radius = this.radiusMin;
        sp._offset.set(0,0,0);
      }

      const pr = sp._radius * pulse;

      const basePos = sp._dir.clone().multiplyScalar(pr);

      sp._offset.lerp(new THREE.Vector3(), dt * this.returnSpeed);

      sp.position.copy(basePos).add(sp._offset);

      const f = (sp._radius - this.radiusMin)/(this.radiusMax - this.radiusMin);
      sp.material.color.copy(this.colorA).lerp(this.colorB, f);
      sp.material.opacity = 0.5 + (1-f)*0.5;

      if (Math.random() < this.flashChance) {
        this.spawnFlash(sp.position);
      }
    }

    this._timer += dt;
    if (this._timer >= this.fastInterval) {
      this._timer = 0;
      this.spawnFast();
    }

    for (let i = this.fast.length -1; i >= 0; i--) {
      const f = this.fast[i];
      f.position.addScaledVector(f._vel, dt);
      f._life -= dt;

      for (const sp of this.sprites) {
        const d = f.position.distanceTo(sp.position);
        if (d < 2.2) {
          const push = sp.position.clone().sub(f.position).setLength(0.7);
          sp._offset.add(push);
        }
      }

      if (f._life <= 0) {
        this.group.remove(f);
        f.material.dispose();
        this.fast.splice(i,1);
      }
    }

    for (const fl of this.flashes) {
      if (!fl.visible) continue;

      fl._life -= dt;
      fl.material.opacity = Math.max(0, fl._life * 7);

      if (fl._life <= 0) {
        fl.visible = false;
      }
    }
  }

  dispose() {
    if (this.group && this.cube) {
      this.cube.remove(this.group);

      this.group.traverse(obj=>{
        if (obj.material) obj.material.dispose();
      });
    }

    this.sprites.length = 0;
    this.fast.length = 0;
    this.flashes.length = 0;
    this.group = null;
  }
}
