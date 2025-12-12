import * as THREE from "three";

export default class PhotonEraTrioEffect {

  constructor(opts = {}) {
    this.layers     = opts.layers     ?? 20;
    this.perLayer   = opts.perLayer   ?? 220; 
    this.radiusMin  = opts.radiusMin  ?? 0.4;
    this.radiusMax  = opts.radiusMax  ?? 6.0;

    this.cloudOrbitSpeed = opts.cloudOrbitSpeed ?? 0.18; 

    this.trioOrbitInner = opts.trioOrbitInner ?? 0.02; 
    this.trioOrbitOuter = opts.trioOrbitOuter ?? 0.05;
    this.trioSpinMin    = opts.trioSpinMin ?? 1.0;
    this.trioSpinMax    = opts.trioSpinMax ?? 3.5;

    this.photonSpeed     = opts.photonSpeed     ?? 12.0;
    this.photonSpawnRate = opts.photonSpawnRate ?? 0.004;
    this.photonScale     = opts.photonScale     ?? 0.04;
    this.collisionRadius = opts.collisionRadius ?? 0.28;

    this.photonSpawnRadius = this.radiusMax + Math.random();
    this.photonDieRadius   = this.radiusMax + 4 

    this.trailCount     = opts.trailCount     ?? 600;
    this.trailFadeTime  = opts.trailFadeTime  ?? 0.10; 
    this.trailScale     = opts.trailScale     ?? this.photonScale;

    this.group = null;
    this.scene = null;
    this.cube = null;

    this.trios = [];     
    this.photons = [];   
    this.trailPool = [];
    this._trailIdx = 0;

    this._spawnTimer = 0;

    this._tmpV3 = new THREE.Vector3();
  }

  _fibonacci(n) {
    const pts = [];
    if (n <= 0) return pts;
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < n; i++) {
      const t = (n === 1) ? 0.5 : i / (n - 1);
      const y = 1 - 2 * t;
      const r = Math.sqrt(Math.max(0, 1 - y*y));
      const theta = golden * i;
      pts.push(new THREE.Vector3(Math.cos(theta)*r, y, Math.sin(theta)*r));
    }
    return pts;
  }

  _mkSpriteMat(color) {
    return new THREE.SpriteMaterial({ color: color.clone(), transparent: true, opacity: 0.95, depthWrite: false });
  }

  init(scene, cube) {
    this.scene = scene;
    this.cube = cube;

    this.group = new THREE.Group();
    this.cube.add(this.group);

    const uA = cube.material.uniforms?.u_colorA?.value?.clone() ?? new THREE.Color("#1800ad");
    const uB = cube.material.uniforms?.u_colorB?.value?.clone() ?? new THREE.Color("#ff751f");
    this.colA = uA;
    this.colB = uB;

    const totalSpritesOrig = this.layers * this.perLayer;
    const trioTotal = Math.max(1, Math.round(totalSpritesOrig / 3)); 
    const perLayerTrios = Math.max(1, Math.round(trioTotal / this.layers));

    for (let l = 0; l < this.layers; l++) {
      const frac = l / Math.max(1, this.layers - 1);
      const radius = THREE.MathUtils.lerp(this.radiusMin, this.radiusMax, frac);

      const baseColor = this.colA.clone().lerp(this.colB, frac);

      const dirs = this._fibonacci(perLayerTrios);

      for (let i = 0; i < dirs.length; i++) {
        const dir = dirs[i].clone();
        const centerPos = dir.clone().multiplyScalar(radius * (0.95 + (Math.random()-0.5)*0.08)); 

        const trioGroup = new THREE.Group();
        trioGroup.position.copy(centerPos);

        const orbitAxis = new THREE.Vector3(Math.random()*2-1, Math.random()*2-1, Math.random()*2-1).normalize();
        const spinSpeed = THREE.MathUtils.lerp(this.trioSpinMin, this.trioSpinMax, Math.random());

        const colR = baseColor.clone().offsetHSL(0.03, 0.08, 0.02); 
        const colY = baseColor.clone().offsetHSL(-0.06, -0.02, 0.06); 
        const colB = baseColor.clone().offsetHSL(-0.12, 0.02, -0.03); 

        const matR = this._mkSpriteMat(colR);
        const matY = this._mkSpriteMat(colY);
        const matB = this._mkSpriteMat(colB);

        const members = [];
        const baseInner = THREE.MathUtils.lerp(this.trioOrbitInner, this.trioOrbitOuter, Math.random());
        const phase = Math.random() * Math.PI * 2;

        for (let k = 0; k < 3; k++) {
          const ang = phase + (k / 3) * Math.PI * 2;
          const local = new THREE.Vector3(
            Math.cos(ang) * baseInner,
            Math.sin(ang) * baseInner * 0.8,
            Math.sin(ang + 0.4) * baseInner * 0.3
          );

          const mat = (k === 0) ? matR : (k === 1) ? matY : matB;

          const sp = new THREE.Sprite(mat);
          sp.position.copy(local);
          sp.scale.set(this.trioOrbitOuter * 0.9, this.trioOrbitOuter * 0.9, 1.0);
          trioGroup.add(sp);
          members.push(sp);
        }

        this.trios.push({
          group: trioGroup,
          center: trioGroup.position.clone(),
          baseRadius: radius,
          currentRadius: radius,
          dir,
          orbitAxis,
          spinSpeed,
          baseInner,
          phase,
          members,
          offset: new THREE.Vector3()
        });

        this.group.add(trioGroup);
      }
    }

    for (let i = 0; i < this.trailCount; i++) {
      const mat = new THREE.SpriteMaterial({
        color: new THREE.Color("#ffffff"),
        transparent: true,
        opacity: 0,
        depthWrite: false
      });
      const tr = new THREE.Sprite(mat);
      tr.scale.set(this.trailScale, this.trailScale, 1.0);
      tr.visible = false;
      this.group.add(tr);
      this.trailPool.push(tr);
    }

    this.photons.length = 0;
    this._spawnTimer = 0;
  }

  spawnPhoton() {
    const mat = new THREE.SpriteMaterial({
      color: new THREE.Color("#ffffff"),
      transparent: true,
      opacity: 1.0,
      depthWrite: false
    });

    const sp = new THREE.Sprite(mat);
    sp.scale.set(this.photonScale, this.photonScale, 1.0);

    const dir = new THREE.Vector3(Math.random()*2-1, Math.random()*2-1, Math.random()*2-1).normalize();
    const startPos = dir.clone().multiplyScalar(this.photonSpawnRadius);

    sp.position.copy(startPos);

    const toCube = startPos.clone().multiplyScalar(-1).normalize();
    const randomDir = new THREE.Vector3(Math.random()*2-1, Math.random()*2-1, Math.random()*2-1).normalize();

    const lateralStrength = 0.45 + Math.random() * 0.5;
    const finalDir = toCube.clone().add(randomDir.multiplyScalar(lateralStrength)).normalize();

    sp._vel = finalDir.multiplyScalar(this.photonSpeed);
    sp._bornRadius = startPos.length();

    this.group.add(sp);
    this.photons.push(sp);
  }

  _spawnTrail(pos) {
    const tr = this.trailPool[this._trailIdx];
    this._trailIdx = (this._trailIdx + 1) % this.trailPool.length;

    tr.visible = true;
    tr.position.copy(pos);
    tr.material.opacity = 1.0;
    tr._life = this.trailFadeTime;
  }

  update(dt, t) {
    if (!this.group) return;

    const pulseQ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), dt * this.cloudOrbitSpeed * 0.2);

    for (const tr of this.trios) {
      const q = new THREE.Quaternion().setFromAxisAngle(tr.orbitAxis, tr.spinSpeed * dt);
      tr.members.forEach((m) => {
        m.position.applyQuaternion(q);
      });

      tr.offset.lerp(new THREE.Vector3(0,0,0), Math.min(1, dt * 2.5));
      tr.group.position.add(tr.offset);

      const pulse = 1.0 + Math.sin(t * 0.6 + (tr.phase % 7)) * 0.002;
      const targetRadius = tr.baseRadius * pulse;
      tr.currentRadius = THREE.MathUtils.lerp(tr.currentRadius, targetRadius, Math.min(1, dt * 0.6));
      tr.group.position.copy(tr.dir.clone().multiplyScalar(tr.currentRadius));
    }

    this._spawnTimer += dt;
    while (this._spawnTimer >= this.photonSpawnRate) {
      this._spawnTimer -= this.photonSpawnRate;
      this.spawnPhoton();
    }

    for (let i = this.photons.length - 1; i >= 0; i--) {
      const ph = this.photons[i];

      this._spawnTrail(ph.position);

      ph.position.addScaledVector(ph._vel, dt);

      for (const tr of this.trios) {
        const d = ph.position.distanceTo(tr.group.position);
        if (d < this.collisionRadius + tr.baseInner + 0.06) {
          const push = ph.position.clone().sub(tr.group.position).normalize();
          ph._vel.addScaledVector(push, 2.5 + Math.random() * 1.5);
          ph._vel.normalize().multiplyScalar(this.photonSpeed);

          const lateral = push.clone().multiplyScalar(0.35 + Math.random() * 0.7);
          tr.offset.add(lateral);

          tr.members.forEach(m => {
            m.material.opacity = Math.min(1.0, (m.material.opacity ?? 0.95) + 0.12);
            m.scale.multiplyScalar(1.05);
          });

          break;
        }
      }

      if (ph.position.length() > this.photonDieRadius + 0.5) {
        this.group.remove(ph);
        if (ph.material) ph.material.dispose();
        this.photons.splice(i, 1);
        continue;
      }
    }

    for (const tr of this.trailPool) {
      if (!tr.visible) continue;
      tr._life -= dt;
      tr.material.opacity = Math.max(0, tr._life / this.trailFadeTime);
      if (tr._life <= 0) {
        tr.visible = false;
      }
    }

    for (const tr of this.trios) {
      tr.members.forEach(m => {
        const target = this.trioOrbitOuter * 0.9;
        const curX = m.scale.x;
        const next = THREE.MathUtils.lerp(curX, target, Math.min(1, dt * 6.0));
        m.scale.set(next, next, 1.0);
        const baseOpacity = 0.9;
        m.material.opacity = THREE.MathUtils.lerp(m.material.opacity, baseOpacity, Math.min(1, dt * 2.5));
      });
    }
  }

  dispose() {
    if (!this.group) return;
    this.cube.remove(this.group);

    this.group.traverse(o => {
      if (o.material) {
        o.material.dispose();
      }
    });

    this.trios.length = 0;
    this.photons.length = 0;
    this.trailPool.length = 0;
    this.group = null;
    this.scene = null;
    this.cube = null;
  }
}
