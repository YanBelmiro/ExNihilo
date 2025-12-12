import * as THREE from "three";

(async () => {
  if (document.readyState === "loading") {
    await new Promise(res => document.addEventListener("DOMContentLoaded", res, { once: true }));
  }

  console.log("[intro] DOM pronto, iniciando intro...");

  const canvas = document.getElementById("intro-canvas");
  const container = document.getElementById("intro");
  if (!canvas || !container) {
    console.error("[intro] Canvas ou container #intro não encontrados.");
    if (container) container.remove();
    return;
  }



  function loadTexture(url) {
    return new Promise((resolve, reject) => {
      const loader = new THREE.TextureLoader();
      loader.setCrossOrigin ? loader.setCrossOrigin('') : null;
      loader.load(
        url,
        tex => resolve(tex),
        undefined,
        err => reject(err)
      );
    });
  }

  const texturePath = "../../assets/svg/aleph.svg";
  console.log("[intro] Tentando carregar textura SVG em:", texturePath);

  let alephTexture = null;
  try {
    alephTexture = await loadTexture(texturePath);
    console.log("[intro] Textura aleph carregada com sucesso.");
    alephTexture.magFilter = THREE.LinearFilter;
    alephTexture.minFilter = THREE.LinearMipmapLinearFilter;
  } catch (err) {
    console.warn("[intro] Falha ao carregar textura SVG (vai usar fallback). Erro:", err);
    alephTexture = null; 
  }

  const scene = new THREE.Scene();

  scene.background = new THREE.Color(0x000000);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 3.5;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: false,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight, false);

const dir = new THREE.DirectionalLight(0xffffff, 1.0);
dir.position.set(2, 2, 4);
dir.color = new THREE.Color("#ff3131");
scene.add(dir);

  const amb = new THREE.AmbientLight(0xffffff);
  scene.add(amb);

  const boxGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);

  const faceMaterials = [];
  const baseColor = new THREE.Color(0x000000); 
  for (let i = 0; i < 6; i++) {
    if (i === 4 && alephTexture) {
      faceMaterials.push(new THREE.MeshStandardMaterial({
        map: alephTexture,
        metalness: 0,
        roughness: 0.45
      }));
    } else if (i === 4 && !alephTexture) {
      faceMaterials.push(new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0,
        roughness: 0.4
      }));
    } else {
      faceMaterials.push(new THREE.MeshStandardMaterial({
        color: baseColor,
        metalness: 0,
        roughness: 0.5
      }));
    }
  }

  const cube = new THREE.Mesh(boxGeo, faceMaterials);
  scene.add(cube);


  const startTime = performance.now();
  const totalMs = 3500;

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  let rafId = null;
  function renderFrame(now) {
    const elapsed = Math.min(now - startTime, totalMs);
    const t = elapsed / totalMs;
    const e = easeOutCubic(t);


    cube.rotation.y = e * Math.PI * 2;
    cube.rotation.x = e * Math.PI * 2;

    renderer.render(scene, camera);

    if (t < 1) {
      rafId = requestAnimationFrame(renderFrame);
    } else {
      container.classList.add("fade-out");
      setTimeout(() => {
        cancelAnimationFrame(rafId);
        renderer.dispose();
        if (container && container.parentNode) container.parentNode.removeChild(container);
      }, 900);
    }
  }

  rafId = requestAnimationFrame(renderFrame);

  window.addEventListener("resize", () => {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

})();


    