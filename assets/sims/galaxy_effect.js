import * as THREE from "three";

export default class GalaxyEffect {
  constructor() {
    this.particles = [];
  }

  init(scene, cube) {

    this.group = new THREE.Group();
    cube.add(this.group);

    const colorA = cube.material.uniforms.u_colorA.value.clone();
    const colorB = cube.material.uniforms.u_colorB.value.clone();

    const count = 7000;

    for (let i = 0; i < count; i++) {
      
      const t = Math.random();
      const mixedColor = colorA.clone().lerp(colorB, t);

      const material = new THREE.SpriteMaterial({
        color: mixedColor
      });

      const sprite = new THREE.Sprite(material);

      sprite.scale.set(0.50*t, 0.50*t, 0.50*t);

      sprite.radius = 0.5 + Math.random() * 20;
      sprite.angle = Math.random() * Math.PI * 2;
      sprite.speed = 0.3 + Math.random() * 0.4;

      this.group.add(sprite);
      this.particles.push(sprite);
    }
  }

  update(dt) {
    for (const p of this.particles) {
      p.angle += dt * p.speed;

      p.position.set(
        Math.cos(p.angle) * p.radius,
        (Math.random() - 0.5) * 0.1,
        Math.sin(p.angle) * p.radius
      );
    }
  }

  dispose(scene, cube) {
    if (this.group) {
      cube.remove(this.group);
      this.group.children.forEach(s => s.material.dispose());
    }
  }
}
