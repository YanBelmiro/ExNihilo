import * as THREE from "three";

export default class LeptonEffect {

  constructor(opts = {}) {
    this.leptonCount = opts.leptonCount ?? 1000;
    this.photonCount = opts.photonCount ?? 200;
    this.trioCountMax = opts.trioCountMax ?? 60;
    this.radius = opts.radius ?? 8;

    this.leptonSpeed = opts.leptonSpeed ?? 4.5;
    this.photonSpeed = opts.photonSpeed ?? 12.0;
    this.trioSpeed = opts.trioSpeed ?? 3.5;

    this.trioRadius = opts.trioRadius ?? 0.1;
    this.trioSpawnChance = opts.trioSpawnChance ?? 0.08;
    this.trioInfluence = opts.trioInfluence ?? 1.8;

    this.leptons = [];
    this.photons = [];
    this.trios = [];

    this.group = null;
  }

  init(scene, cube) {
    this.scene = scene;
    this.cube = cube;

    this.group = new THREE.Group();
    cube.add(this.group);

    this.colorTrio = cube.material.uniforms?.u_colorA?.value.clone() ?? new THREE.Color("#ff3131");
    this.colorLepton = cube.material.uniforms?.u_colorB?.value.clone() ?? new THREE.Color("#316bff");
    this.colorPhoton = new THREE.Color("#ffffff");

    for (let i = 0; i < this.leptonCount; i++) {
      const mat = new THREE.SpriteMaterial({ color: this.colorLepton.clone(), transparent: true, opacity: 0.8 });
      const sp = new THREE.Sprite(mat);
      sp.scale.set(0.06, 0.06, 0.06);
      sp.position.set((Math.random()*2-1)*this.radius, (Math.random()*2-1)*this.radius, (Math.random()*2-1)*this.radius);
      sp._vel = new THREE.Vector3(Math.random()*2-1, Math.random()*2-1, Math.random()*2-1).normalize().multiplyScalar(this.leptonSpeed);
      this.leptons.push(sp);
      this.group.add(sp);
    }

    for (let i = 0; i < this.photonCount; i++) {
      const mat = new THREE.SpriteMaterial({ color: this.colorPhoton.clone(), transparent: true, opacity: 1.0 });
      const sp = new THREE.Sprite(mat);
      sp.scale.set(0.05, 0.05, 0.05);
      sp.position.set((Math.random()*2-1)*this.radius, (Math.random()*2-1)*this.radius, (Math.random()*2-1)*this.radius);
      sp._vel = new THREE.Vector3(Math.random()*2-1, Math.random()*2-1, Math.random()*2-1).normalize().multiplyScalar(this.photonSpeed);
      this.photons.push(sp);
      this.group.add(sp);
    }
  }

  spawnTrio() {
    if (this.trios.length >= this.trioCountMax) return;

    const center = new THREE.Vector3(
      (Math.random()*2-1)*this.radius*0.8,
      (Math.random()*2-1)*this.radius*0.8,
      (Math.random()*2-1)*this.radius*0.8
    );

    const trio = { center: center.clone(), parts: [] };

    for (let j = 0; j < 3; j++) {
      const mat = new THREE.SpriteMaterial({ color: this.colorTrio.clone(), transparent: true, opacity: 0.95 });
      const sp = new THREE.Sprite(mat);
      sp.scale.set(0.08, 0.08, 0.08);

      const angle = (j/3)*Math.PI*2;
      const px = Math.cos(angle)*this.trioRadius;
      const py = Math.sin(angle)*this.trioRadius;
      sp.position.copy(center.clone().add(new THREE.Vector3(px, py, 0)));
      sp._angle = angle;
      trio.parts.push(sp);
      this.group.add(sp);
    }

    this.trios.push(trio);
  }

  update(dt, t) {
    for (const trio of this.trios) {
      for (const p of trio.parts) {
        p._angle += dt * this.trioSpeed;
        const px = Math.cos(p._angle)*this.trioRadius;
        const py = Math.sin(p._angle)*this.trioRadius;
        p.position.set(trio.center.x + px, trio.center.y + py, trio.center.z);
      }
    }

    for (const l of this.leptons) {
      l.position.addScaledVector(l._vel, dt);

      if (l.position.length() > this.radius) {
        l.position.set((Math.random()*2-1)*this.radius, (Math.random()*2-1)*this.radius, (Math.random()*2-1)*this.radius);
      }

      for (const trio of this.trios) {
        const toTrio = trio.center.clone().sub(l.position);
        const dist = toTrio.length();
        if (dist < this.trioInfluence) {
          const dir = l._vel.clone().normalize();
          const lateral = toTrio.clone().cross(dir).normalize();
          l._vel.addScaledVector(lateral, dt*2.5);
        }
      }
    }

    for (const f of this.photons) {
      f.position.addScaledVector(f._vel, dt);
      if (f.position.length() > this.radius) {
        f.position.set((Math.random()*2-1)*this.radius, (Math.random()*2-1)*this.radius, (Math.random()*2-1)*this.radius);
      }
    }

    if (Math.random() < this.trioSpawnChance) this.spawnTrio();
  }

  dispose() {
    if (!this.group) return;
    this.cube.remove(this.group);
    this.group.traverse(o=>{ if(o.material) o.material.dispose(); });
    this.leptons.length = 0;
    this.photons.length = 0;
    this.trios.length = 0;
    this.group = null;
  }
}
