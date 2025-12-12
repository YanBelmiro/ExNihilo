import * as THREE from "three";

export default class StellarEffect {

  init(scene, cube) {

    this.star = cube;
    this.group = new THREE.Group();
    scene.add(this.group);

    this.planets = [];
    this.asteroids = [];
    this.nebula = [];

    const colA = cube.material.uniforms.u_colorA.value.clone();
    const colB = cube.material.uniforms.u_colorB.value.clone();
    const colWhite = new THREE.Color("#ffffff");

    const nebulaCount = 100;

    for (let i = 0; i < nebulaCount; i++) {

      let col;
      const r = Math.random();

      if (r < 0.45) {
        col = colWhite.clone().lerp(colA, Math.random() * 0.4);
      } else if (r < 0.9) {
        col = colWhite.clone().lerp(colB, Math.random() * 0.3);
      } else {
        col = colWhite.clone();
      }

      const mat = new THREE.SpriteMaterial({
        color: col,
        transparent: true,
        opacity: 0.65
      });

      const sp = new THREE.Sprite(mat);
      sp.scale.set(0.06, 0.06, 0.06);

      const radius = 10.5 + Math.random() * 4.0;
      const v = new THREE.Vector3(
        Math.random()*2 - 1,
        Math.random()*2 - 1,
        Math.random()*2 - 1
      ).normalize().multiplyScalar(radius);

      sp.position.copy(v);

      sp.orbitAxis = new THREE.Vector3(
        Math.random()*2 - 1,
        Math.random()*2 - 1,
        Math.random()*2 - 1
      ).normalize();

      sp.orbitSpeed = 0.04 + Math.random() * 0.08;

      sp.pulseOffset = Math.random() * Math.PI * 2;

      this.nebula.push(sp);
      this.group.add(sp);
    }

    const planetData = [
      { size: 0.04, color: "#ffffff",  dist: 0.7,  speed: -1.4 },
      { size: 0.08, color: "#ffde59", dist: 1.0,  speed: -1.1 },
      { size: 0.09, color: "#1800ad", dist: 1.2,  speed: -1.0 },
      { size: 0.06, color: "#ff3131", dist: 1.55, speed: -0.85 },
      { size: 0.30, color: "#ff751f", dist: 2.5,  speed: -0.6 },
      { size: 0.24, color: "#ffde59", dist: 3.1,  speed: -0.45 },
      { size: 0.19, color: "#1800ad", dist: 3.8,  speed: -0.32 },
      { size: 0.20, color: "#1800ad", dist: 4.6,  speed: -0.25 }
    ];

    for (const data of planetData) {
      const geo = new THREE.BoxGeometry(data.size, data.size, data.size);
      const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(data.color) });

      const planet = new THREE.Mesh(geo, mat);

      planet.dist = data.dist;
      planet.speed = data.speed;
      planet.angle = Math.random() * Math.PI * 2;

      this.planets.push(planet);
      this.group.add(planet);
    }

    const asteroidCount = 100;

    const asteroidColorA = colWhite.clone();
    const asteroidColorB = colA.clone().lerp(colB, 0.35);

    for (let i = 0; i < asteroidCount; i++) {

      const t = Math.random();
      const col = asteroidColorA.clone().lerp(asteroidColorB, t);

      const material = new THREE.SpriteMaterial({
        color: col,
        transparent: true,
        opacity: 0.85
      });

      const sprite = new THREE.Sprite(material);

      sprite.scale.set(0.04, 0.04, 0.04);

      sprite.radius = 1.7 + Math.random() * 0.4;
      sprite.angle = Math.random() * Math.PI * 2;
      sprite.speed = 0.15 + Math.random() * 0.15;

      this.asteroids.push(sprite);
      this.group.add(sprite);
    }
  }

  update(dt, t) {
    for (const p of this.nebula) {
      p.position.applyAxisAngle(p.orbitAxis, dt * p.orbitSpeed);

      const pulse = 0.7 + Math.sin(t * 2.5 + p.pulseOffset) * 0.3;
      p.material.opacity = pulse * 0.6;
    }

    for (const p of this.planets) {
      p.angle += dt * p.speed;
      p.position.set(
        Math.cos(p.angle) * p.dist,
        0,
        Math.sin(p.angle) * p.dist
      );
    }

    for (const a of this.asteroids) {
      a.angle += dt * a.speed;
      a.position.set(
        Math.cos(a.angle) * a.radius,
        (Math.random() - 0.5) * 0.01,
        Math.sin(a.angle) * a.radius
      );
    }
  }

  dispose(scene) {
    if (this.group) {
      for (const p of this.planets) p.material.dispose();
      for (const a of this.asteroids) a.material.dispose();
      for (const n of this.nebula) n.material.dispose();
      scene.remove(this.group);
    }
  }
}
