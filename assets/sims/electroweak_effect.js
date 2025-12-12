import * as THREE from "three";

export default class ElectroweakEffect {

  constructor(opts = {}) {
    this.maxPairs = opts.maxPairs ?? 10000; 
    this.spawnRate = opts.spawnRate ?? 0.50;
    this.pairs = [];
    this.beams = [];
    this.group = null;

    this._u_colorA = null;
    this._u_colorB = null;
    this._u_time   = null;
  }

  init(scene, cube) {
    this.cube = cube;
    this.group = new THREE.Group();
    cube.add(this.group);

    const uniforms = cube.material.uniforms ?? {};

    this._u_colorA = uniforms.u_colorA ?? { value: new THREE.Color("#00aaff") };
    this._u_colorB = uniforms.u_colorB ?? { value: new THREE.Color("#ffaa00") };
    this._u_time   = uniforms.u_time   ?? { value: 0.0 };

    this.spriteScale = 0.07;
  }

  spawnPair() {
    const radius = 0.6 + Math.random() * 5.2;

    const speed = 0.4 + Math.random() * 0.8;

    let angle = Math.random() * Math.PI * 2;

    const orbitAxis = new THREE.Vector3(
      Math.random()*2 - 1,
      Math.random()*2 - 1,
      Math.random()*2 - 1
    ).normalize();

    const createParticle = (col) => {
      const mat = new THREE.SpriteMaterial({ color: col, opacity: 1.0, transparent: true });
      const sp = new THREE.Sprite(mat);
      sp.scale.set(this.spriteScale, this.spriteScale, this.spriteScale);
      sp.radius = radius;
      sp.angle = angle;
      sp.speed = speed;
      sp.orbitAxis = orbitAxis; 
      sp.alive = true;
      return sp;
    };

    const pA = createParticle(this._u_colorA.value.clone());
    const pB = createParticle(this._u_colorB.value.clone());

    pB.angle = angle + Math.PI;

    const tempPosA = new THREE.Vector3(Math.cos(pA.angle) * radius, 0, Math.sin(pA.angle) * radius);
    const tempPosB = new THREE.Vector3(Math.cos(pB.angle) * radius, 0, Math.sin(pB.angle) * radius);

    tempPosA.applyAxisAngle(orbitAxis, angle);
    tempPosB.applyAxisAngle(orbitAxis, angle);

    pA.position.copy(tempPosA);
    pB.position.copy(tempPosB);

    this.group.add(pA);
    this.group.add(pB);

    this.pairs.push({ pA, pB, radius, angle, speed, orbitAxis, collided: false });
  }

  spawnBeamExplosion(position) {
    const beamCount = 12;
    for (let i = 0; i < beamCount; i++) {
      const mat = new THREE.SpriteMaterial({
        color: new THREE.Color("#ffffff"),
        transparent: true,
        opacity: 1.0
      });

      const sp = new THREE.Sprite(mat);
      sp.scale.set(0.05, 0.05, 0.05);

      sp.position.copy(position);

      sp.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 1.5,
        (Math.random() - 0.5) * 1.5,
        (Math.random() - 0.5) * 1.5
      );

      sp.life = 0.45 + Math.random() * 0.25;

      this.group.add(sp);
      this.beams.push(sp);
    }
  }

  update(dt, t) {

    if (this.pairs.length < this.maxPairs && Math.random() < this.spawnRate) {
      this.spawnPair();
    }

    for (const pair of this.pairs) {
      const { pA, pB, orbitAxis } = pair;

      if (!pA.alive || !pB.alive) continue;

      pA.angle += pair.speed * dt;
      pB.angle -= pair.speed * dt;

      const baseA = new THREE.Vector3(Math.cos(pA.angle) * pair.radius, 0, Math.sin(pA.angle) * pair.radius);
      const baseB = new THREE.Vector3(Math.cos(pB.angle) * pair.radius, 0, Math.sin(pB.angle) * pair.radius);

      baseA.applyAxisAngle(orbitAxis, pA.angle);
      baseB.applyAxisAngle(orbitAxis, pB.angle);

      pA.position.copy(baseA);
      pB.position.copy(baseB);

      if (!pair.collided) {
        const dist = pA.position.distanceTo(pB.position);
        if (dist < 0.18) {
          pair.collided = true;

          this.spawnBeamExplosion(pA.position);

          pA.alive = false;
          pB.alive = false;
          pA.material.opacity = 0;
          pB.material.opacity = 0;

          setTimeout(() => {
            this.group.remove(pA);
            this.group.remove(pB);
          }, 5);
        }
      }
    }

    for (let i = this.beams.length - 1; i >= 0; i--) {
      const b = this.beams[i];

      b.position.addScaledVector(b.velocity, dt * 10.0);
      b.life -= dt;

      b.material.opacity = Math.max(0, b.life * 2.0);

      if (b.life <= 0) {
        this.group.remove(b);
        this.beams.splice(i, 1);
      }
    }
  }

  dispose(scene, cube) {
    if (!this.group) return;

    cube.remove(this.group);

    this.group.traverse(obj => {
      if (obj.material) obj.material.dispose();
      if (obj.geometry) obj.geometry.dispose();
    });

    this.group = null;
    this.pairs = [];
    this.beams = [];
  }
}
