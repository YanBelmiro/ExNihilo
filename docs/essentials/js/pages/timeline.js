import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { ERAS } from "./eras.js";
import CubeEngine from "../core/cubeEngine.js"; 

const SHADER_PATH = "../../assets/shaders/";

async function fetchText(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Falha ao buscar: ${path}`);
  return await res.text();
}

const NOISE_SRC = await fetchText(SHADER_PATH + "noise.glsl");
function preprocess(src) {
  return NOISE_SRC + "\n\n" + src;
}



async function loadGLSL(name) {
  const raw = await fetchText(SHADER_PATH + name);
  return preprocess(raw);
}

const canvas = document.getElementById("timeline-canvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 2000);
camera.position.set(0, 0.9, 2.2); 

const ambient = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambient);

const gltfLoader = new GLTFLoader();

const SHADERS = {
  sky: preprocess(await fetchText(SHADER_PATH + "sky.glsl")),
  cubeVertex: preprocess(await fetchText(SHADER_PATH + "cube_vertex.glsl")),
  cubeBaseFrag: preprocess(await fetchText(SHADER_PATH + "cube_fragment_base.glsl"))
};

const cubeEngine = new CubeEngine({
  scene, camera, renderer,
  shaders: SHADERS
});

const tituloEl = document.getElementById("era-titulo");
const intervaloEl = document.getElementById("era-intervalo");
const descEl = document.getElementById("era-descricao");

let currentIndex = 0;

async function applyEra(index) {
  const era = ERAS[index];
  currentIndex = index;

  if (tituloEl) tituloEl.textContent = era.nome;
  if (intervaloEl) intervaloEl.textContent = era.intervalo;
  if (descEl) descEl.textContent = era.descricao;

  await cubeEngine.setSky(era.sky?.uniforms ?? { u_intensity: 0.12 });

  await cubeEngine.setCubeConfig({
    shaderName: era.cube?.shader ?? "base",
    uniforms: era.cube?.uniforms ?? {},

    scale: era.scale ?? 1,
    rotation: era.rotation ?? [0, 0, 0],
    autoRotate: era.autoRotate ?? [0, 0, 0]
  });

  if (era.effect) {
    try {
      const mod = await import(era.effect);

      if (mod?.default) {
        cubeEngine.setEffect(new mod.default({ scene, camera, renderer }));
      } else if (typeof mod === "function") {
        cubeEngine.setEffect({
          init: () => mod(scene, cubeEngine.getCube()),
          update: () => {}
        });
      } else {
        cubeEngine.setEffect(null);
      }
    } catch (err) {
      console.error("[timeline] falha ao importar effect:", era.effect, err);
      cubeEngine.setEffect(null);
    }
  } else {
    cubeEngine.setEffect(null);
  }

  await cubeEngine.transitionTo(1.0, { duration: 1.2 });
}


document.addEventListener("wheel", e => {
  e.preventDefault();
  const dir = e.deltaY > 0 ? -1 : 1;
  const next = (currentIndex + dir + ERAS.length) % ERAS.length;
  applyEra(next);
}, { passive: false });

document.addEventListener("keydown", e => {
  if (e.key === "ArrowRight") applyEra((currentIndex + 1) % ERAS.length);
  if (e.key === "ArrowLeft") applyEra((currentIndex - 1 + ERAS.length) % ERAS.length);
});

const btnPrev = document.getElementById("prev-era");
const btnNext = document.getElementById("next-era");

btnPrev.addEventListener("click", () => {
  applyEra((currentIndex - 1 + ERAS.length) % ERAS.length);
});

btnNext.addEventListener("click", () => {
  applyEra((currentIndex + 1) % ERAS.length);
});

const btnPlay = document.getElementById("play-era");

btnPlay.addEventListener("click", () => {
  const era = ERAS[currentIndex];

  if (!era.page) {
    console.warn("Era não possui página:", era);
    return;
  }

  window.parent.postMessage({
    type: "open-era-page",
    page: era.page
  }, "*");
});

window.addEventListener("resize", () => {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  cubeEngine.onResize(w, h);
});

const clock = new THREE.Clock();
function animate() {
  const dt = clock.getDelta();
  const t = clock.elapsedTime;

  cubeEngine.update(dt, t);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

await cubeEngine.init();
await applyEra(0);
animate();

export { cubeEngine, SHADERS };
