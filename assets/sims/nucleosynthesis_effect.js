import * as THREE from "three";

export default class NucleosynthesisEffect {

  constructor(opts = {}) {

    this.countTrios = opts.countTrios ?? 480;
    this.countTetra = opts.countTetra ?? 120;

    this.leptonCount = opts.leptonCount ?? 240;
    this.photonCount = opts.photonCount ?? 120;

    this.cloudRadius = opts.cloudRadius ?? 10.0;

    this.trioOrbitRadius = opts.trioOrbitRadius ?? 0.05;
    this.trioSpinSpeed   = opts.trioSpinSpeed   ?? 10.0;

    this.centerMotionSpeed = opts.centerMotionSpeed ?? 0.08;

    this.leptonSpeed = opts.leptonSpeed ?? 1.2;
    this.photonSpeed = opts.photonSpeed ?? 12.0;

    this.tetraRadius = opts.tetraRadius ?? 0.1;
    this.tetraSpin   = opts.tetraSpin   ?? 1.0;

    this.trioScale   = opts.trioScale   ?? 0.048;
    this.leptonScale = opts.leptonScale ?? 0.035;
    this.photonScale = opts.photonScale ?? 0.03;

    this._defaultR = new THREE.Color("#ff3333");
    this._defaultY = new THREE.Color("#ffee33");
    this._defaultB = new THREE.Color("#3366ff");

    this.group = null;
    this.scene = null;
    this.cube  = null;

    this.protonTrios  = [];
    this.neutronTrios = [];
    this.tetras       = [];
    this.leptons      = [];
    this.photons      = [];
  }

  _makeHadronStylePalette(uPrim, uSec) {
    const white = new THREE.Color("#ffffff");

    return {
      R: uSec.clone().lerp(white, 0.12),
      Y: uPrim.clone().lerp(uSec, 0.5),
      B: uPrim.clone()
    };
  }

  init(scene, cube) {
    this.scene = scene;
    this.cube  = cube;

    const uA = cube.material.uniforms.u_colorA.value.clone();
    const uB = cube.material.uniforms.u_colorB.value.clone();

    this._paletteProton  = this._makeHadronStylePalette(uA, uB);
    this._paletteNeutron = this._makeHadronStylePalette(uB, uA);

    this.group = new THREE.Group();
    this.cube.add(this.group);

    const makeSprite = (color, scale) => {
      const mat = new THREE.SpriteMaterial({
        color: color.clone(),
        transparent: true,
        opacity: 1.0,
        depthWrite: false
      });
      const s = new THREE.Sprite(mat);
      s.scale.set(scale, scale, scale);
      return s;
    };

    const makeTrio = (palette) => {

      const g = new THREE.Group();

      const centerDir = new THREE.Vector3(
        Math.random()*2-1,Math.random()*2-1,Math.random()*2-1
      ).normalize();

      const centerPos = centerDir.clone().multiplyScalar(
        Math.random()*this.cloudRadius
      );

      g.position.copy(centerPos);

      const orbitAxis = new THREE.Vector3(
        Math.random()*2-1,Math.random()*2-1,Math.random()*2-1
      ).normalize();

      const colors = [palette.R, palette.Y, palette.B];

      const members = [];

      for (let i = 0; i < 3; i++) {
        const sp = makeSprite(colors[i], this.trioScale);

        const ang = (i/3)*Math.PI*2;

        const local = new THREE.Vector3(
          Math.cos(ang)*this.trioOrbitRadius,
          Math.sin(ang)*this.trioOrbitRadius*0.6,
          Math.sin(ang+0.3)*this.trioOrbitRadius*0.3
        );

        sp.position.copy(local);
        g.add(sp);
        members.push(sp);
      }

      this.group.add(g);

      return {
        group: g,
        centerPos: centerPos.clone(),
        orbitAxis,
        spinSpeed: this.trioSpinSpeed*(0.7+Math.random()*0.6),
        members
      };
    };

    for (let i = 0; i < Math.floor(this.countTrios*0.6); i++)
      this.protonTrios.push(makeTrio(this._paletteProton));

    for (let i = 0; i < Math.floor(this.countTrios*0.4); i++)
      this.neutronTrios.push(makeTrio(this._paletteNeutron));


    for (let t = 0; t < this.countTetra; t++) {

      const g = new THREE.Group();

      const centerDir = new THREE.Vector3(
        Math.random()*2-1,Math.random()*2-1,Math.random()*2-1
      ).normalize();

      const centerPos = centerDir.clone().multiplyScalar(
        this.cloudRadius*0.5*Math.random()
      );

      g.position.copy(centerPos);

      const spinAxis = new THREE.Vector3(
        Math.random()*2-1,Math.random()*2-1,Math.random()*2-1
      ).normalize();

      const u = new THREE.Vector3(1,0,0).cross(spinAxis);
      if (u.length() < 0.3) u.set(0,1,0).cross(spinAxis);
      u.normalize();
      const v = spinAxis.clone().cross(u).normalize();

      const triObjs = [];
      for (let k = 0; k < 4; k++) {
        const ang = (k/4)*Math.PI*2;
        const rel = u.clone().multiplyScalar(Math.cos(ang)*this.tetraRadius)
                      .add(v.clone().multiplyScalar(Math.sin(ang)*this.tetraRadius));

        const isProton = (k % 2 === 0);

        const palette = isProton ? this._paletteProton : this._paletteNeutron;

        const trioMeta = this._makeLocalTrio(rel, palette);

        triObjs.push(trioMeta);
        g.add(trioMeta.group);
      }

      this.group.add(g);
      this.tetras.push({
        group: g,
        triObjs,
        spinAxis,
        spinSpeed: this.tetraSpin*(0.6+Math.random()*0.8)
      });
    }

    for (let i = 0; i < this.leptonCount; i++) {

      const col = new THREE.Color("#ffde59");
      const sp = makeSprite(col, this.leptonScale);

      sp.position.copy(
        new THREE.Vector3(
          Math.random()*2-1,Math.random()*2-1,Math.random()*2-1
        ).normalize().multiplyScalar(Math.random()*this.cloudRadius)
      );

      sp._vel = new THREE.Vector3(
        Math.random()*2-1,Math.random()*2-1,Math.random()*2-1
      ).normalize().multiplyScalar(this.leptonSpeed);

      this.group.add(sp);
      this.leptons.push(sp);
    }

    for (let i = 0; i < this.photonCount; i++) {
      const sp = makeSprite(new THREE.Color("#ffffff"), this.photonScale);

      sp.position.copy(
        new THREE.Vector3(
          Math.random()*2-1,Math.random()*2-1,Math.random()*2-1
        ).normalize().multiplyScalar(Math.random()*this.cloudRadius)
      );

      sp._vel = new THREE.Vector3(
        Math.random()*2-1,Math.random()*2-1,Math.random()*2-1
      ).normalize().multiplyScalar(this.photonSpeed);

      sp._life = 6 + Math.random()*5;

      this.group.add(sp);
      this.photons.push(sp);
    }
  }

  _makeLocalTrio(localPos, palette) {

    const g = new THREE.Group();
    g.position.copy(localPos);

    const members = [];
    const colors = [palette.R, palette.Y, palette.B];

    for (let i = 0; i < 3; i++) {
      const ang = (i/3)*Math.PI*2;
      const pos = new THREE.Vector3(
        Math.cos(ang)*this.trioOrbitRadius,
        Math.sin(ang)*this.trioOrbitRadius*0.6,
        Math.sin(ang+0.3)*this.trioOrbitRadius*0.3
      );

      const sp = new THREE.Sprite(new THREE.SpriteMaterial({
        color: colors[i].clone(),
        transparent: true,
        opacity: 1.0,
        depthWrite: false
      }));

      sp.scale.set(this.trioScale,this.trioScale,this.trioScale);
      sp.position.copy(pos);
      g.add(sp);
      members.push(sp);
    }

    return {
      group: g,
      members,
      spinSpeed: this.trioSpinSpeed*(0.9+Math.random()*0.4)
    };
  }

  update(dt, t) {

    const spin = (meta) => {
      const q = new THREE.Quaternion()
        .setFromAxisAngle(meta.orbitAxis ?? new THREE.Vector3(0,1,0), meta.spinSpeed*dt);

      meta.group.children.forEach(c => {
        c.position.applyQuaternion(q);
      });
    };

    for (const tr of this.protonTrios)  spin(tr);
    for (const tr of this.neutronTrios) spin(tr);

    for (const te of this.tetras) {
      te.group.rotateOnAxis(te.spinAxis, te.spinSpeed*dt);

      for (const tri of te.triObjs) {
        const q = new THREE.Quaternion()
          .setFromAxisAngle(new THREE.Vector3(0.3,0.7,0.2).normalize(), tri.spinSpeed*dt);

        tri.group.children.forEach(c => c.position.applyQuaternion(q));
      }
    }

    for (const l of this.leptons) {
      l.position.addScaledVector(l._vel, dt);

      if (l.position.length() > this.cloudRadius * 1.3) {

        l.position.copy(
          new THREE.Vector3(
            Math.random()*2-1,Math.random()*2-1,Math.random()*2-1
          ).normalize().multiplyScalar(this.cloudRadius)
        );

        l._vel.set(
          Math.random()*2-1,Math.random()*2-1,Math.random()*2-1
        ).normalize().multiplyScalar(this.leptonSpeed);
      }

      const applyDeflection = (meta) => {
        const d = l.position.distanceTo(meta.group.position);
        if (d < 1.0) {
          const dir = l.position.clone().sub(meta.group.position).normalize();
          l._vel.addScaledVector(dir, 0.07*(1.0-d));
        }
      };

      this.protonTrios.forEach(applyDeflection);
      this.neutronTrios.forEach(m => {
        const d = l.position.distanceTo(m.group.position);
        if (d < 0.7) {
          l._vel.addScaledVector(l.position.clone().sub(m.group.position).normalize(), 0.03*(0.7-d));
        }
      });
    }

    for (const p of this.photons) {
      p.position.addScaledVector(p._vel, dt);
      p._life -= dt;

      if (p._life <= 0 || p.position.length() > this.cloudRadius*2.0) {
        p.position.copy(
          new THREE.Vector3(Math.random()*2-1,Math.random()*2-1,Math.random()*2-1)
            .normalize().multiplyScalar(this.cloudRadius)
        );
        p._vel.set(
          Math.random()*2-1,Math.random()*2-1,Math.random()*2-1
        ).normalize().multiplyScalar(this.photonSpeed);
        p._life = 6+Math.random()*5;
      }
    }
  }

  dispose() {
    if (!this.group) return;
    this.cube.remove(this.group);
    this.group.traverse(o=>o.material?.dispose());
    this.group = null;
  }
}
