import * as THREE from "three";

export default class QuarkEffect {

  constructor(opts = {}) {
    this.count         = opts.count ?? 2400;      
    this.radius        = opts.radius ?? 6.5;       
    this.quarkSpeed    = opts.quarkSpeed ?? 8.0;   
    this.gluonCount    = opts.gluonCount ?? 450;   
    this.gluonSpeed    = opts.gluonSpeed ?? 10.5;  
    this.linkChance    = opts.linkChance ?? 0.004; 
    this.linkLife      = opts.linkLife ?? 0.18;    

    this.quarks  = [];
    this.gluons  = [];
    this.links   = [];

    this.group = null;
  }

  init(scene, cube) {
    this.scene = scene;
    this.cube = cube;

    this.group = new THREE.Group();
    cube.add(this.group);

    this.colors = [
      new THREE.Color("#ff3131"), 
      new THREE.Color("#ffde59"), 
      new THREE.Color("#1800ad")  
    ];

    for (let i = 0; i < this.count; i++) {

      const col = this.colors[Math.floor(Math.random() * this.colors.length)].clone();

      const mat = new THREE.SpriteMaterial({
        color: col,
        transparent: true,
        opacity: 1.0,
        depthWrite: false
      });

      const sp = new THREE.Sprite(mat);

      const pos = new THREE.Vector3(
        (Math.random()*2 - 1),
        (Math.random()*2 - 1),
        (Math.random()*2 - 1)
      ).normalize().multiplyScalar(Math.random()*this.radius*0.9);

      sp.position.copy(pos);

      const s = 0.055 + Math.random()*0.03;
      sp.scale.set(s, s, s);

      sp._vel = new THREE.Vector3(
        (Math.random()*2 -1),
        (Math.random()*2 -1),
        (Math.random()*2 -1)
      ).multiplyScalar(this.quarkSpeed);

      this.group.add(sp);
      this.quarks.push(sp);
    }

    for (let i = 0; i < this.gluonCount; i++) {

      const mat = new THREE.SpriteMaterial({
        color: new THREE.Color("#ffffff"),
        transparent: true,
        opacity: 0.6,
        depthWrite: false
      });

      const sp = new THREE.Sprite(mat);

      const pos = new THREE.Vector3(
        (Math.random()*2 - 1),
        (Math.random()*2 - 1),
        (Math.random()*2 - 1)
      ).normalize().multiplyScalar(Math.random()*this.radius);

      sp.position.copy(pos);

      sp.scale.set(0.04, 0.04, 0.04);

      sp._vel = new THREE.Vector3(
        (Math.random()*2 -1),
        (Math.random()*2 -1),
        (Math.random()*2 -1)
      ).multiplyScalar(this.gluonSpeed);

      sp._colTime = Math.random()*1.2; 

      this.group.add(sp);
      this.gluons.push(sp);
    }

    this.linkPool = [];
    for (let i = 0; i < 80; i++) {
      const mat = new THREE.SpriteMaterial({
        color: new THREE.Color("#ffffff"),
        transparent: true,
        opacity: 0
      });

      const l = new THREE.Sprite(mat);
      l.scale.set(0.1, 0.1, 0.1);
      l.visible = false;
      this.group.add(l);
      this.linkPool.push(l);
    }
  }

  spawnLink(pos) {
    for (const l of this.linkPool) {
      if (!l.visible) {
        l.visible = true;
        l.position.copy(pos);
        l.material.opacity = 1;
        l._life = this.linkLife;
        return;
      }
    }
  }

  update(dt, t) {
    for (const q of this.quarks) {

      q.position.addScaledVector(q._vel, dt);

      if (q.position.length() > this.radius) {
        q._vel.multiplyScalar(-1);
      }

      if (Math.random() < this.linkChance) {
        this.spawnLink(q.position);
      }
    }

    for (const g of this.gluons) {

      g.position.addScaledVector(g._vel, dt);

      if (g.position.length() > this.radius) {
        g._vel.multiplyScalar(-1);
      }

      g._colTime -= dt;
      if (g._colTime <= 0) {
        g._colTime = 0.15 + Math.random()*0.25;
        g.material.color.copy(
          this.colors[Math.floor(Math.random()*this.colors.length)]
        );
      }

      if (Math.random() < this.linkChance * 0.4) {
        this.spawnLink(g.position);
      }
    }

    for (const l of this.linkPool) {
      if (!l.visible) continue;
      l._life -= dt;
      l.material.opacity = Math.max(0, l._life * 5);
      if (l._life <= 0) {
        l.visible = false;
      }
    }
  }

  dispose() {
    if (this.group) {
      this.cube.remove(this.group);
      this.group.traverse((o) => o.material?.dispose());
    }

    this.quarks.length = 0;
    this.gluons.length = 0;
    this.linkPool.length = 0;
    this.group = null;
  }
}
