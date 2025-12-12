import * as THREE from "three";

export default class WhiteDwarfEffect {

  constructor() {
    this.asteroids = [];
    this.jetParticles = [];
  }

  init(scene, cube) {

    this.group = new THREE.Group();
    cube.add(this.group);

    const colorA = cube.material.uniforms.u_colorA.value.clone();
    const colorB = cube.material.uniforms.u_colorB.value.clone();

    const asteroidCount = 500;

    const asteroidColorA = new THREE.Color("#ffffff");
    const asteroidColorB = new THREE.Color("#ff751f");

    for (let i = 0; i < asteroidCount; i++) {

      const t = Math.random();
      const col = asteroidColorA.clone().lerp(asteroidColorB, t);

      const material = new THREE.SpriteMaterial({
        color: col,
        transparent: true,
        opacity: 0.85
      });

      const sprite = new THREE.Sprite(material);
      sprite.scale.set(0.05, 0.05, 0.05);

      sprite.radius = 1.70 + Math.random() * 1;
      sprite.angle = Math.random() * Math.PI * 2;
      sprite.speed = 0.15 + Math.random() * 0.15;

      this.asteroids.push(sprite);
      this.group.add(sprite);
    }

    this.jetGroup = new THREE.Group();
    cube.add(this.jetGroup);

    const jetCount = 600;

    for (let i = 0; i < jetCount; i++) {

      const t = Math.random();
      const colorC = new THREE.Color("#ffffff");
      const colorD = new THREE.Color("#1800ad");

      const mixed = colorC.clone().lerp(colorD, t);

      const mat = new THREE.SpriteMaterial({
        color: mixed,
        transparent: true
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
    for (const a of this.asteroids) {
      a.angle += dt * a.speed;
      a.position.set(
        Math.cos(a.angle) * a.radius,
        (Math.random() - 0.5) * 0.01,
        Math.sin(a.angle) * a.radius
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
      this.asteroids.forEach(a => a.material.dispose());
    }

    if (this.jetGroup) {
      cube.remove(this.jetGroup);
      this.jetGroup.children.forEach(s => s.material.dispose());
    }
  }
}
