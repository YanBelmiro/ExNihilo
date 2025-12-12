import * as THREE from "three";

export default class QuarkEffect {
  constructor(opts = {}) {
    this.trioCount    = opts.trioCount    ?? 4000;    
    this.radiusMin    = opts.radiusMin    ?? 0.8;    
    this.radiusMax    = opts.radiusMax    ?? 6.0;    
    this.driftSpeed   = opts.driftSpeed   ?? 0.02;   
    this.orbitalMin   = opts.orbitalMin   ?? 0.01;   
    this.orbitalMax   = opts.orbitalMax   ?? 0.06;   
    this.orbitalSpeed = opts.orbitalSpeed ?? 1.2;    
    this.noiseAmp     = opts.noiseAmp     ?? 0.03;   
    this.opacity      = opts.opacity      ?? 0.92;   
    this.scale        = opts.scale        ?? 0.045;  
    this.useCubeColors = opts.useCubeColors ?? true; 

    this.scene = null;
    this.cube  = null;
    this.group = null;

    this.trios = []; 
    this._tmpV3 = new THREE.Vector3();

    this._matR = null;
    this._matY = null;
    this._matB = null;

    this._defaultR = new THREE.Color("#ff3333");
    this._defaultY = new THREE.Color("#ffee33");
    this._defaultB = new THREE.Color("#3366ff");
  }

  _randPointInShell(rmin, rmax, target = new THREE.Vector3()) {
    const u = Math.random();
    const r = Math.cbrt(u * (Math.pow(rmax, 3) - Math.pow(rmin, 3)) + Math.pow(rmin, 3));
    const theta = Math.acos(2 * Math.random() - 1);
    const phi = Math.random() * Math.PI * 2;
    const sinT = Math.sin(theta);
    target.set(Math.cos(phi) * sinT, Math.cos(theta), Math.sin(phi) * sinT).multiplyScalar(r);
    return target;
  }

  _getPaletteFromCube(cube) {
    if (!this.useCubeColors || !cube || !cube.material || !cube.material.uniforms) {
      return { r: this._defaultR.clone(), y: this._defaultY.clone(), b: this._defaultB.clone() };
    }
    const uA = cube.material.uniforms.u_colorA?.value;
    const uB = cube.material.uniforms.u_colorB?.value;
    if (!uA || !uB) {
      return { r: this._defaultR.clone(), y: this._defaultY.clone(), b: this._defaultB.clone() };
    }

    const colorA = (uA.clone) ? uA.clone() : new THREE.Color(uA);
    const colorB = (uB.clone) ? uB.clone() : new THREE.Color(uB);

    const colB = colorA.clone();
    const colR = colorB.clone().lerp(new THREE.Color(0xffffff), 0.12);
    const colY = colorA.clone().lerp(colorB, 0.5);

    return { r: colR, y: colY, b: colB };
  }

  init(scene, cube) {
    this.scene = scene;
    this.cube  = cube;

    this.group = new THREE.Group();
    this.cube.add(this.group);

    const pal = this._getPaletteFromCube(cube);
    const colR = pal.r;
    const colY = pal.y;
    const colB = pal.b;

    this._matR = new THREE.SpriteMaterial({ color: colR.clone(), transparent: true, opacity: this.opacity, depthWrite: false });
    this._matY = new THREE.SpriteMaterial({ color: colY.clone(), transparent: true, opacity: this.opacity, depthWrite: false });
    this._matB = new THREE.SpriteMaterial({ color: colB.clone(), transparent: true, opacity: this.opacity, depthWrite: false });

    for (let i = 0; i < this.trioCount; i++) {
      const cm = new THREE.Vector3();
      this._randPointInShell(this.radiusMin, this.radiusMax, cm);

      const axis = new THREE.Vector3(Math.random()*2-1, Math.random()*2-1, Math.random()*2-1).normalize();

      let u = new THREE.Vector3();
      if (Math.abs(axis.x) < 0.9) u.set(1,0,0).cross(axis).normalize();
      else u.set(0,1,0).cross(axis).normalize();
      const v = axis.clone().cross(u).normalize();

      const baseInner = THREE.MathUtils.lerp(this.orbitalMin, this.orbitalMax, Math.random());

      const phase = Math.random() * Math.PI * 2;

      const drift = new THREE.Vector3((Math.random()-0.5)*this.driftSpeed, (Math.random()-0.5)*this.driftSpeed, (Math.random()-0.5)*this.driftSpeed);

      const sR = new THREE.Sprite(this._matR.clone());
      const sY = new THREE.Sprite(this._matY.clone());
      const sB = new THREE.Sprite(this._matB.clone());

      sR.scale.set(this.scale, this.scale, this.scale);
      sY.scale.set(this.scale, this.scale, this.scale);
      sB.scale.set(this.scale, this.scale, this.scale);

      this.group.add(sR, sY, sB);

      const trio = {
        cm: cm.clone(),
        drift,
        axis,
        u, v,
        baseInner,
        innerRadius: baseInner * (0.85 + Math.random() * 0.3),
        orbitalSpeed: this.orbitalSpeed * (0.6 + Math.random()*0.9),
        phases: [phase, phase + (Math.PI*2)/3, phase + (Math.PI*4)/3],
        sprites: [sR, sY, sB],
        wobble: Math.random() * 6.0
      };

      this._updateTrioPositionsImmediate(trio, 0);

      this.trios.push(trio);
    }
  }

  _updateTrioPositionsImmediate(trio, t) {
    const { cm, u, v, innerRadius, phases, sprites } = trio;
    for (let k = 0; k < 3; k++) {
      const a = phases[k];
      const pos = this._tmpV3.set(0,0,0)
        .addScaledVector(u, Math.cos(a) * innerRadius)
        .addScaledVector(v, Math.sin(a) * innerRadius)
        .add(cm);
      sprites[k].position.copy(pos);
      sprites[k].material.color.offsetHSL(0, 0, (Math.random()-0.5) * 0.03);
    }
  }

  update(dt, t) {
    if (!this.group) return;

    const tmp = new THREE.Vector3();
    const tmp2 = new THREE.Vector3();

    for (let i = 0, L = this.trios.length; i < L; i++) {
      const tr = this.trios[i];

      tr.cm.addScaledVector(tr.drift, dt);
      const n = Math.sin(t * 0.7 + tr.wobble) * this.noiseAmp;
      tr.cm.addScaledVector(tr.axis, n * dt * 0.6);

      const r = tr.cm.length();
      if (r > this.radiusMax + 0.5) {
        this._randPointInShell(this.radiusMin, (this.radiusMin + this.radiusMax)*0.2, tr.cm);
        tr.drift.set((Math.random()-0.5)*this.driftSpeed, (Math.random()-0.5)*this.driftSpeed, (Math.random()-0.5)*this.driftSpeed);
        tr.innerRadius = tr.baseInner * (0.8 + Math.random()*0.5);
      }

      for (let k = 0; k < 3; k++) {
        tr.phases[k] += dt * tr.orbitalSpeed * (1.0 + Math.sin(t*0.5 + (k*0.7 + tr.wobble))*0.12);
      }

      const innerR = tr.innerRadius * (1 + Math.sin(t * (2.0 + (tr.wobble%3))) * 0.08);

      for (let k = 0; k < 3; k++) {
        const a = tr.phases[k];
        tmp.copy(tr.u).multiplyScalar(Math.cos(a) * innerR);
        tmp2.copy(tr.v).multiplyScalar(Math.sin(a) * innerR);
        tmp.add(tmp2).add(tr.cm);
        tr.sprites[k].position.copy(tmp);

        const depthPulse = 1.0 + (Math.sin(t * 6 + i * 0.001 + k) * 0.03);
        tr.sprites[k].scale.set(this.scale * depthPulse, this.scale * depthPulse, 1.0);

        const mat = tr.sprites[k].material;
        if (mat) {
          const b = 0.9 + Math.sin(t * 8 + i * 0.01 + k) * 0.08;
          mat.opacity = Math.min(1.0, this.opacity * b);
        }
      }
    }
  }

  dispose() {
    if (!this.group || !this.cube) return;

    this.cube.remove(this.group);

    for (const tr of this.trios) {
      for (const s of tr.sprites) {
        if (s.material) s.material.dispose();
        if (s.parent) s.parent.remove(s);
      }
    }

    this.trios.length = 0;

    if (this._matR) this._matR.dispose();
    if (this._matY) this._matY.dispose();
    if (this._matB) this._matB.dispose();

    this.group = null;
    this.scene = null;
    this.cube = null;
  }
}
