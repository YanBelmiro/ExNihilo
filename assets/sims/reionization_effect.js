import * as THREE from "three";

export default class ReionizationEffect {

  constructor() {
    this.bubbles = [];
    this.stars = [];
    this.miniStars = [];
    this.nebula = [];
  }

  init(scene, cube) {

    this.group = new THREE.Group();
    cube.add(this.group);

    const colA = cube.material.uniforms.u_colorA.value.clone();
    const colB = cube.material.uniforms.u_colorB.value.clone();
    const colWhite = new THREE.Color("#ffffff");

    const nebulaCount = 2200;

    for (let i = 0; i < nebulaCount; i++) {

      const r = Math.random();
      let col;

      if (r < 0.45) col = colWhite.clone().lerp(colA, Math.random()*0.45);
      else if (r < 0.9) col = colWhite.clone().lerp(colB, Math.random()*0.35);
      else col = colWhite.clone();

      const mat = new THREE.SpriteMaterial({
        color: col,
        transparent: true,
        opacity: 0.75
      });

      const sp = new THREE.Sprite(mat);
      sp.scale.set(0.055, 0.055, 0.055);

      const radius = 2.8 + Math.random() * 4.0;
      const pos = new THREE.Vector3(
        Math.random()*2 - 1,
        Math.random()*2 - 1,
        Math.random()*2 - 1
      ).normalize().multiplyScalar(radius);

      sp.position.copy(pos);

      sp.orbitAxis = new THREE.Vector3(
        Math.random()*2 - 1,
        Math.random()*2 - 1,
        Math.random()*2 - 1
      ).normalize();

      sp.orbitSpeed = 0.1 + Math.random() * 0.35;

      sp.pulseOffset = Math.random() * Math.PI * 2;

      this.nebula.push(sp);
      this.group.add(sp);
    }



    const miniStarCount = 22;

    for (let i = 0; i < miniStarCount; i++) {

      const mat = cube.material.clone();
      mat.uniforms = cube.material.uniforms; 

      const geo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
      const mini = new THREE.Mesh(geo, mat);

      const radius = 3 + Math.random() * 30.5;
      const pos = new THREE.Vector3(
        Math.random()*2 - 1,
        Math.random()*2 - 1,
        Math.random()*2 - 1
      ).normalize().multiplyScalar(radius);

      mini.position.copy(pos);

      mini.orbitAxis = new THREE.Vector3(
        Math.random()*2 - 1,
        Math.random()*2 - 1,
        Math.random()*2 - 1
      ).normalize();

      mini.orbitSpeed = 0.07 + Math.random()*0.20;

      this.miniStars.push(mini);
      this.group.add(mini);
    }



    const bubbleCount = 25;
    const bubbleColor = colB.clone().lerp(colWhite, 0.35);

    for (let i = 0; i < bubbleCount; i++) {

      const mat = new THREE.SpriteMaterial({
        color: bubbleColor.clone(),
        transparent: true,
        opacity: 0.16
      });

      const b = new THREE.Sprite(mat);
      b.scale.set(0.18, 0.18, 0.18);

      b.growth = 0.25 + Math.random() * 0.35;
      b.life = 3.0 + Math.random() * 2.8;

      b.position.set(
        (Math.random() - 0.5) * 2.5,
        (Math.random() - 0.5) * 2.5,
        (Math.random() - 0.5) * 2.5
      );

      this.bubbles.push(b);
      this.group.add(b);
    }

    const starCount = 150;

    for (let i = 0; i < starCount; i++) {

      const mat = new THREE.SpriteMaterial({
        color: colWhite.clone().lerp(colA, Math.random()*0.4),
        transparent: true,
        opacity: 0
      });

      const s = new THREE.Sprite(mat);
      s.scale.set(0.04, 0.04, 0.04);

      s.flashTime = 0;
      s.flashSpeed = 1.6 + Math.random()*0.8;

      s.position.set(
        (Math.random()-0.5)*6.8,
        (Math.random()-0.5)*6.8,
        (Math.random()-0.5)*6.8
      );

      this.stars.push(s);
      this.group.add(s);
    }
  }

  update(dt, t) {
    for (const p of this.nebula) {

      p.position.applyAxisAngle(p.orbitAxis, dt * p.orbitSpeed);

      const pulse = 0.75 + Math.sin(t * 3.0 + p.pulseOffset) * 0.25;
      p.material.opacity = 0.55 + pulse * 0.30;
    }

    for (const m of this.miniStars) {
      m.position.applyAxisAngle(m.orbitAxis, dt * m.orbitSpeed);
    }

    for (const b of this.bubbles) {
      b.life -= dt;

      b.scale.multiplyScalar(1 + dt * b.growth);
      b.material.opacity = Math.max(0, b.life * 0.12);

      if (b.life <= 0) {
        b.scale.set(0.15, 0.15, 0.15);
        b.life = 3.0 + Math.random() * 3.0;
        b.material.opacity = 0.16;
      }
    }

    for (const s of this.stars) {
      s.flashTime += dt * s.flashSpeed;
      const pulse = Math.sin(s.flashTime * 4.0);
      s.material.opacity = Math.max(0, pulse);
    }
  }

  dispose(scene, cube) {
    if (!this.group) return;

    cube.remove(this.group);
    this.group.children.forEach(obj => {
      if (obj.material) obj.material.dispose();
    });
  }
}
