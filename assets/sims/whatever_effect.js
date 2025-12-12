export default class EraEffect {
    constructor({ scene, camera, renderer }) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;

        this.objects = []; 
    }

    init(scene, cube) {
    }

    update(dt, t, cube, engine) {
    }

    dispose(scene, cube) {
        for (const o of this.objects) {
            scene.remove(o);
            if (o.geometry) o.geometry.dispose();
            if (o.material) o.material.dispose();
        }
        this.objects = [];
    }
}
