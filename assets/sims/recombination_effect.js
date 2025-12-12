// recombination_effect.js — versão com elétron simples + FOTONS COM TRAIL (sem colisão)
// Mantém performance (poucos fotons + trail pool)

import * as THREE from "three";

export default class RecombinationEffect {

  constructor(opts = {}) {
    // --- EXISTENTE ---
    this.countTrios = opts.countTrios ?? 480;
    this.countTetra = opts.countTetra ?? 120;

    this.cloudRadius = opts.cloudRadius ?? 10.0;

    this.trioOrbitRadius = opts.trioOrbitRadius ?? 0.04;
    this.trioSpinSpeed = opts.trioSpinSpeed ?? 8.0;
    this.trioScale = opts.trioScale ?? 0.048;

    this.tetraRadius = opts.tetraRadius ?? 0.08;
    this.tetraSpin = opts.tetraSpin ?? 1.0;

    // elétrons simplificados
    this.electronOrbitRadiusH = opts.electronOrbitRadiusH ?? 0.28;
    this.electronOrbitRadiusHe = opts.electronOrbitRadiusHe ?? 0.45;
    this.electronScale = opts.electronScale ?? 0.04;
    this.electronOrbitalSpeed = opts.electronOrbitalSpeed ?? 2.8;

    // CORES
    this._defaultR = new THREE.Color("#ff3333");
    this._defaultY = new THREE.Color("#ffee33");
    this._defaultB = new THREE.Color("#3366ff");

    // --- NOVO: FÓTONS ---
    this.photonSpeed = opts.photonSpeed ?? 14.0;
    this.photonSpawnRate = opts.photonSpawnRate ?? 0.04;   // poucos
    this.photonScale = opts.photonScale ?? 0.035;
    this.photonSpawnRadius = this.cloudRadius + 12;       // nasce fora
    this.photonDieRadius = this.cloudRadius + 12;         // morre fora

    this.trailCount = opts.trailCount ?? 350;
    this.trailFadeTime = opts.trailFadeTime ?? 0.10;
    this.trailScale = opts.trailScale ?? this.photonScale;

    // runtime
    this.scene = null;
    this.cube = null;
    this.group = null;

    this.protonTrios = [];
    this.neutronTrios = [];
    this.tetras = [];
    this.electrons = [];

    // Fótons
    this.photons = [];
    this.trailPool = [];
    this._trailIdx = 0;

    this._spawnTimer = 0;
  }

  _makeHadronStylePalette(uPrim, uSec) {
    const white = new THREE.Color("#ffffff");
    return {
      R: uSec.clone().lerp(white, 0.12),
      Y: uPrim.clone().lerp(uSec, 0.5),
      B: uPrim.clone()
    };
  }

  _makeSprite(color, scale) {
    const mat = new THREE.SpriteMaterial({
      color: color.clone(),
      transparent: true,
      opacity: 1.0,
      depthWrite: false
    });
    const s = new THREE.Sprite(mat);
    s.scale.set(scale, scale, scale);
    return s;
  }

  _createTrioGroup(palette) {
    const g = new THREE.Group();

    const centerDir = new THREE.Vector3(Math.random()*2-1,Math.random()*2-1,Math.random()*2-1).normalize();
    g.position.copy(centerDir.multiplyScalar(Math.random()*this.cloudRadius));

    const axis = new THREE.Vector3(Math.random()*2-1,Math.random()*2-1,Math.random()*2-1).normalize();

    const colors = [palette.R, palette.Y, palette.B];
    const members = [];

    for (let i = 0; i < 3; i++) {
      const sp = this._makeSprite(colors[i], this.trioScale);
      const a = (i/3)*Math.PI*2;
      sp.position.set(
        Math.cos(a)*this.trioOrbitRadius,
        Math.sin(a)*this.trioOrbitRadius*0.6,
        Math.sin(a+0.3)*this.trioOrbitRadius*0.3
      );
      g.add(sp);
      members.push(sp);
    }

    return {
      group: g,
      orbitAxis: axis,
      spinSpeed: this.trioSpinSpeed*(0.7+Math.random()*0.6),
      members
    };
  }

  _makeLocalTrio(rel, palette) {
    const g = new THREE.Group();
    g.position.copy(rel);

    const members = [];
    const colors = [palette.R, palette.Y, palette.B];

    for (let i = 0; i < 3; i++) {
      const sp = this._makeSprite(colors[i], this.trioScale);
      const a = (i/3)*Math.PI*2;
      sp.position.set(
        Math.cos(a)*this.trioOrbitRadius,
        Math.sin(a)*this.trioOrbitRadius*0.6,
        Math.sin(a+0.3)*this.trioOrbitRadius*0.3
      );
      g.add(sp);
      members.push(sp);
    }

    return {
      group: g,
      spinSpeed: this.trioSpinSpeed*(0.9+Math.random()*0.4)
    };
  }

  init(scene, cube) {
    this.scene = scene;
    this.cube = cube;

    const uA = cube.material.uniforms.u_colorA.value.clone();
    const uB = cube.material.uniforms.u_colorB.value.clone();

    this._paletteProton = this._makeHadronStylePalette(uA, uB);
    this._paletteNeutron = this._makeHadronStylePalette(uB, uA);

    this.group = new THREE.Group();
    cube.add(this.group);

    // ----------------- TRIOS -----------------
    for (let i = 0; i < Math.floor(this.countTrios*0.6); i++) {
      const t = this._createTrioGroup(this._paletteProton);
      this.group.add(t.group);
      this.protonTrios.push(t);
    }
    for (let i = 0; i < Math.floor(this.countTrios*0.4); i++) {
      const t = this._createTrioGroup(this._paletteNeutron);
      this.group.add(t.group);
      this.neutronTrios.push(t);
    }

    // ----------------- TETRAS -----------------
    for (let k = 0; k < this.countTetra; k++) {
      const g = new THREE.Group();
      const dir = new THREE.Vector3(Math.random()*2-1,Math.random()*2-1,Math.random()*2-1).normalize();
      g.position.copy(dir.multiplyScalar(this.cloudRadius*0.5*Math.random()));

      const axis = new THREE.Vector3(Math.random()*2-1,Math.random()*2-1,Math.random()*2-1).normalize();

      let u = new THREE.Vector3(1,0,0).cross(axis);
      if (u.length() < 0.3) u = new THREE.Vector3(0,1,0).cross(axis);
      u.normalize();
      const v = axis.clone().cross(u).normalize();

      const triObjs = [];
      for (let j = 0; j < 4; j++) {
        const a = (j/4)*Math.PI*2;
        const rel = u.clone().multiplyScalar(Math.cos(a)*this.tetraRadius)
                     .add(v.clone().multiplyScalar(Math.sin(a)*this.tetraRadius));
        const palette = (j%2===0)? this._paletteProton : this._paletteNeutron;
        const trio = this._makeLocalTrio(rel, palette);
        triObjs.push(trio);
        g.add(trio.group);
      }

      this.group.add(g);
      this.tetras.push({
        group: g,
        triObjs,
        spinAxis: axis,
        spinSpeed: this.tetraSpin*(0.6+Math.random()*0.8)
      });
    }

    // ----------------- ELETRONS (sem cloud) -----------------
    this._electronMat = new THREE.SpriteMaterial({
      color: new THREE.Color("#d8f3ff"),
      transparent: true,
      opacity: 0.95,
      depthWrite: false
    });

    const createElectron = (hostPos, R) => {
      const core = new THREE.Sprite(this._electronMat.clone());
      core.scale.set(this.electronScale, this.electronScale, 1);
      this.group.add(core);

      const axis = new THREE.Vector3(
        Math.random()*2-1, Math.random()*2-1, Math.random()*2-1
      ).normalize();

      let u = new THREE.Vector3();
      if (Math.abs(axis.x) < 0.9) u.set(1,0,0).cross(axis).normalize();
      else u.set(0,1,0).cross(axis).normalize();
      const v = axis.clone().cross(u).normalize();

      return {
        core,
        axis, u, v,
        hostPosition: hostPos.clone(),
        radius: R*(0.9+Math.random()*0.2),
        phase: Math.random()*Math.PI*2,
        speed: this.electronOrbitalSpeed*(0.7+Math.random()*0.7)
      };
    };

    for (const tr of [...this.protonTrios, ...this.neutronTrios]) {
      this.electrons.push(createElectron(tr.group.position, this.electronOrbitRadiusH));
    }

    for (const te of this.tetras) {
      const h = te.group.position;
      const e1 = createElectron(h, this.electronOrbitRadiusHe);
      const e2 = createElectron(h, this.electronOrbitRadiusHe*1.05);
      e2.phase += Math.PI*0.5;
      this.electrons.push(e1, e2);
    }

    // ----------------- TRAIL POOL -----------------
    for (let i = 0; i < this.trailCount; i++) {
      const mat = new THREE.SpriteMaterial({
        color: new THREE.Color("#ffffff"),
        transparent: true,
        opacity: 0,
        depthWrite: false
      });
      const tr = new THREE.Sprite(mat);
      tr.scale.set(this.trailScale, this.trailScale, 1);
      tr.visible = false;
      this.group.add(tr);
      this.trailPool.push(tr);
    }
  }

  // ----------------- FOTON -----------------
  spawnPhoton() {
    const mat = new THREE.SpriteMaterial({
      color: new THREE.Color("#ffffff"),
      transparent: true,
      opacity: 1,
      depthWrite: false
    });

    const sp = new THREE.Sprite(mat);
    sp.scale.set(this.photonScale, this.photonScale, 1);

    const dir = new THREE.Vector3(Math.random()*2-1,Math.random()*2-1,Math.random()*2-1).normalize();
    const pos = dir.clone().multiplyScalar(this.photonSpawnRadius);

    sp.position.copy(pos);

    // direção tendendo ao centro, sem colisão
    const toCenter = pos.clone().multiplyScalar(-1).normalize();
    const randomDir = new THREE.Vector3(Math.random()*2-1,Math.random()*2-1,Math.random()*2-1).normalize();

    const finalDir = toCenter.add(randomDir.multiplyScalar(0.35)).normalize();
    sp._vel = finalDir.multiplyScalar(this.photonSpeed);

    this.group.add(sp);
    this.photons.push(sp);
  }

  _spawnTrail(pos) {
    const t = this.trailPool[this._trailIdx];
    this._trailIdx = (this._trailIdx+1)%this.trailPool.length;

    t.visible = true;
    t.position.copy(pos);
    t.material.opacity = 1;
    t._life = this.trailFadeTime;
  }

  // ----------------- UPDATE -----------------
  update(dt, t) {
    if (!this.group) return;

    // ---------- TRIOS ----------
    const spinLocal = (meta)=>{
      const q = new THREE.Quaternion().setFromAxisAngle(meta.orbitAxis, meta.spinSpeed*dt);
      meta.group.children.forEach(c => c.position.applyQuaternion(q));
    };

    this.protonTrios.forEach(spinLocal);
    this.neutronTrios.forEach(spinLocal);

    // ---------- TETRAS ----------
    for (const te of this.tetras) {
      te.group.rotateOnAxis(te.spinAxis, te.spinSpeed*dt);

      const q = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0.3,0.7,0.2).normalize(),
        dt*1.2
      );

      for (const tr of te.triObjs) {
        tr.group.children.forEach(c => c.position.applyQuaternion(q));
      }
    }

    // ---------- ELETRONS ----------
    for (const e of this.electrons) {
      e.phase += dt*e.speed;

      const x = Math.cos(e.phase)*e.radius;
      const y = Math.sin(e.phase)*e.radius;

      const pos = new THREE.Vector3()
        .copy(e.hostPosition)
        .add(e.u.clone().multiplyScalar(x))
        .add(e.v.clone().multiplyScalar(y));

      e.core.position.copy(pos);

      const p = 1 + Math.sin(t*12 + e.phase*1.2)*0.1;
      e.core.scale.set(this.electronScale*p, this.electronScale*p, 1);
    }

    // ---------- FOTONS ----------
    this._spawnTimer += dt;
    while (this._spawnTimer >= this.photonSpawnRate) {
      this._spawnTimer -= this.photonSpawnRate;
      this.spawnPhoton();
    }

    for (let i = this.photons.length-1; i >= 0; i--) {
      const ph = this.photons[i];

      this._spawnTrail(ph.position);

      ph.position.addScaledVector(ph._vel, dt);

      if (ph.position.length() > this.photonDieRadius + 2) {
        this.group.remove(ph);
        ph.material.dispose();
        this.photons.splice(i,1);
        continue;
      }
    }

    // ---------- TRAILS ----------
    for (const tr of this.trailPool) {
      if (!tr.visible) continue;
      tr._life -= dt;
      tr.material.opacity = Math.max(0, tr._life / this.trailFadeTime);
      if (tr._life <= 0) tr.visible = false;
    }
  }

  dispose() {
    if (!this.group) return;
    this.cube.remove(this.group);
    this.group.traverse(o=>o.material?.dispose());
    this.group = null;
  }
}
