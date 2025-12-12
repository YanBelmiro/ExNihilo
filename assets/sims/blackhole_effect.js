import * as THREE from "three";

export default class BlackHoleEffect {
  constructor() {
    this.disk = [];
    this.jets = [];
  }

  init(scene, cube) {

    this.group = new THREE.Group();
    cube.add(this.group);

    const colorA = cube.material.uniforms.u_colorA.value.clone();
    const colorB = cube.material.uniforms.u_colorB.value.clone();

    const diskCount = 4000;

    for (let i = 0; i < diskCount; i++) {

      const t = Math.random();
      const mixed = colorA.clone().lerp(colorB, t);

      const mat = new THREE.SpriteMaterial({ color: mixed });
      const sprite = new THREE.Sprite(mat);

      sprite.scale.set(0.07, 0.07, 0.07);

      sprite.radius = 0.5 + Math.random() * 3.0; 
      sprite.angle = Math.random() * Math.PI * 2;
      sprite.speed = 1.0 + Math.random() * 1.6; 

      this.group.add(sprite);
      this.disk.push(sprite);
    }

    this.jetGroup = new THREE.Group();
    cube.add(this.jetGroup);

    this.jetParticles = [];

    const jetCount = 600;

    for (let i = 0; i < jetCount; i++) {
      const t = Math.random();
      const colorC = new THREE.Color(0xffffff);
      const colorD = new THREE.Color(0x1800ad);

      const mixed = colorC.clone().lerp(colorD, t);

      const mat = new THREE.SpriteMaterial({
        color: mixed
      });

      const jet = new THREE.Sprite(mat);
      jet.scale.set(0.05, 0.05, 0.05);

      jet.alive = false;
      jet.life = 0;

      this.jetGroup.add(jet);
      this.jetParticles.push(jet);
    }
  }

  spawnJetParticle(p, direction) {
    
    p.position.set(
      (Math.random() - 0.5) * 0.1,
      0,
      (Math.random() - 0.5) * 0.1
    );

    p.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.02,
      direction * (0.50 + Math.random() * 1.2),
      (Math.random() - 0.5) * 0.02
    );

    p.life = 1.0 + Math.random() * 1.3;
    p.alive = true;
  }

  update(dt) {

    for (const p of this.disk) {
      p.angle += dt * p.speed;

      p.position.set(
        Math.cos(p.angle) * p.radius,
        (Math.random() - 0.5) * 0.08,
        Math.sin(p.angle) * p.radius
      );
    }

    for (const p of this.jetParticles) {

      if (!p.alive) {
        if (Math.random() < 0.1) {
          const dir = Math.random() < 0.5 ? +1 : -1;
          this.spawnJetParticle(p, dir);
        }
        continue;
      }

      p.position.addScaledVector(p.velocity, dt * 8.0);

      p.life -= dt;
      if (p.life <= 0 || Math.abs(p.position.y) > 6.0) {
        p.alive = false;
      }
    }
  }

  dispose(scene, cube) {
    if (this.group) {
      cube.remove(this.group);
      this.group.children.forEach(s => s.material.dispose());
    }
    if (this.jetGroup) {
      cube.remove(this.jetGroup);
      this.jetGroup.children.forEach(s => s.material.dispose());
    }
  }
}
