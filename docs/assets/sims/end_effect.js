import * as THREE from "three";

export default class EndEffect {

  constructor() {
    this.particles = [];
  }

  init(scene, cube) {

    this.group = new THREE.Group();
    cube.add(this.group);

    const count = 500;

    const colorA = new THREE.Color("#ffde59");
    const colorB = new THREE.Color("#ff3131");
    const colorC = new THREE.Color("#ff751f");

    for (let i = 0; i < count; i++) {

      const r = Math.random();
      let col;

      if (r < 0.6)      col = colorA.clone().lerp(colorB, Math.random()*0.35);  
      else if (r < 0.9) col = colorA.clone().lerp(colorC, Math.random()*0.2);   
      else              col = colorA.clone();                                   

      const material = new THREE.SpriteMaterial({
        color: col,
        transparent: true,
        opacity: 0.9
      });

      const sprite = new THREE.Sprite(material);

      sprite.scale.set(0.03, 0.03, 0.03);

      const radius = 6.6 + Math.random() * 30.2;

      const v = new THREE.Vector3(
        Math.random()*2 - 1,
        Math.random()*2 - 1,
        Math.random()*2 - 1
      ).normalize().multiplyScalar(radius);

      sprite.position.copy(v);

      sprite.orbitAxis = new THREE.Vector3(
        Math.random()*2 - 1,
        Math.random()*2 - 1,
        Math.random()*2 - 1
      ).normalize();

      sprite.orbitSpeed = 0.2 + Math.random() * 10.6;

      sprite.pulseOffset = Math.random() * Math.PI * 2;

      this.particles.push(sprite);
      this.group.add(sprite);
    }
  }


  update(dt, t) {

    for (const p of this.particles) {

      p.position.applyAxisAngle(p.orbitAxis, dt * p.orbitSpeed);

      const pulse = 0.75 + Math.sin(t * 4 + p.pulseOffset) * 0.25;
      p.material.opacity = pulse;
    }
  }


  dispose(scene, cube) {
    if (this.group) {
      cube.remove(this.group);
      this.group.children.forEach(s => s.material.dispose());
    }
  }
}
