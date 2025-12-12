export const ERAS = [

/* ============================================================
   0 — NÃO-ERA
============================================================ */
{
  id: 0,
  nome: "Não-Era — Estado Adimensional e Homogêneo",
  intervalo: "Sem intervalo — pois não há tempo",
  descricao: `Do Nada.`,

  page: "../../pages/eras/0.html",

  sky: { uniforms: { u_intensity: 0.0 } },

  cube: {
    shader: "base",
    uniforms: {
      u_tint: "#000000",
      u_disp: 0.0,
      u_emissive: 1.0,
      u_showPlanck: 1.0,
      u_showPairs: 0.0,
      u_showOrbits: 0.0,
      u_pointDensity: 0.0
    }
  },

  scale: 1,
  rotation: [0, 0, 0],
  autoRotate: [0, 0, 0],

  effect: null
},

/* ============================================================
   1 — PLANCK
============================================================ */
{
  id: 1,
  nome: "Era de Planck",
  intervalo: "0 – 10⁻⁴³ s",
  descricao: `Espaço-tempo nasce de um campo quântico altamente instável.
Gravidade não separada. Flutuações violentas.`,

  page: "../../pages/eras/1.html",

  sky: { uniforms: { u_intensity: 0.1 } },

  cube: {
    shader: "base",
    uniforms: {
      u_tint: "#000000",
      u_disp: 0.0001,
      u_showPlanck: 1.0,
      u_showPairs: 0.0,
      u_showOrbits: 0.0,
      u_pointDensity: 0.0,
      u_emissive: 1.0,
      u_colorA: "#8c00ff",
      u_colorB: "#ff3131"
    }
  },

  scale: 0.8,
  rotation: [0, 0, 0],
  autoRotate: [2, 2, 2],

  effect: "../../../assets/sims/planck_effect.js"
},

/* ============================================================
   2 — GRANDE UNIFICAÇÃO
============================================================ */
{
  id: 2,
  nome: "Era da Grande Unificação",
  intervalo: "10⁻⁴³ – 10⁻³⁶ s",
  descricao: `Gravidade se separa das outras forças.
Energia extrema.`,

  page: "../../pages/eras/2.html",

  sky: { uniforms: { u_intensity: 0.2 } },

  cube: {
    shader: "base",
    uniforms: {
      u_tint: "#ffffff",
      u_disp: 0.0001,
      u_emissive: 0.0,
      u_showPlanck: 1.0,
      u_showPairs: 0.0,
      u_showOrbits: 0.0,
      u_pointDensity: 0.0,
      u_colorA: "#1800ad",
      u_colorB: "#ffffff"
    }
  },

  scale: 0.5,
  rotation: [0, 0, 0],
  autoRotate: [0, 0.1, 0],

  effect: "../../../assets/sims/greatUnification_effect.js"
},

/* ============================================================
   3 — INFLACIONÁRIA
============================================================ */
{
  id: 3,
  nome: "Era Inflacionária",
  intervalo: "~10⁻³⁶ – 10⁻³² s",
  descricao: `Expansão exponencial do espaço.
Sementes das galáxias.`,

  page: "../../pages/eras/3.html",

  sky: { uniforms: { u_intensity: 0.1 } },

  cube: {
    shader: "base",
    uniforms: {
      u_tint: "#ffffff",
      u_disp: -0.0001,
      u_emissive: 0.0,
      u_showPlanck: 1.0,
      u_showPairs: 0.0,
      u_showOrbits: 0.0,
      u_pointDensity: 0.0,
      u_colorA: "#ffffff",
      u_colorB: "#1800ad"
    }
  },

  scale: 0.5,
  rotation: [0, 0, 0],
  autoRotate: [0, 0.1, 0],

  effect: "../../../assets/sims/inflation_effect.js"
},

/* ============================================================
   4 — ELETROFRACA
============================================================ */
{
  id: 4,
  nome: "Era Eletrofraca",
  intervalo: "10⁻³⁶ a 10⁻¹² s",
  descricao: `Formação de pares matéria/antimatéria; plasma denso.`,

  page: "../../pages/eras/4.html",

  sky: { uniforms: { u_intensity: 0.1 } },

  cube: {
    shader: "base",
    uniforms: {
      u_tint: "#000000",
      u_disp: 0.0001,
      u_emissive: 1.0,
      u_showPlanck: 0.0,
      u_showPairs: 1.0,
      u_showOrbits: 1.0,
      u_pointDensity: 0.0,
      u_colorA: "#ff751f",
      u_colorB: "#1800ad"
    }
  },

  scale: 0.5,
  rotation: [0, 0, 0],
  autoRotate: [0.1, 2, 0.1],

  effect: "../../../assets/sims/electroweak_effect.js"
},

/* ============================================================
   5 — QUARKS
============================================================ */
{
  id: 5,
  nome: "Era dos Quarks",
  intervalo: "10⁻¹² – 10⁻⁶ s",
  descricao: `Sopa densa de quarks e glúons.`,

  page: "../../pages/eras/5.html",

  sky: { uniforms: { u_intensity: 0.2 } },

  cube: {
    shader: "base",
    uniforms: {
      u_tint: "#ffffff",
      u_disp: 0.0,
      u_emissive: 1.0,
      u_showPlanck: 0.0,
      u_showPairs: 0.0,
      u_showOrbits: 0.0,
      u_pointDensity: 0.0,
      u_colorA: "#ff6633",
      u_colorB: "#1800ad"
    }
  },

  scale: 0.5,
  rotation: [0, 0, 0],
  autoRotate: [0.1, 0.1, 0.1],

  effect: "../../../assets/sims/quark_effect.js"
},

/* ============================================================
   6 — HÁDRONS
============================================================ */
{
  id: 6,
  nome: "Era dos Hádrons",
  intervalo: "10⁻⁶ – 1 s",
  descricao: `Prótons e nêutrons emergem da sopa primordial.`,

  page: "../../pages/eras/6.html",

  sky: { uniforms: { u_intensity: 0.2 } },

  cube: {
    shader: "base",
    uniforms: {
      u_tint: "#ffffff",
      u_disp: 0.0,
      u_emissive: 1.0,
      u_showPlanck: 0.0,
      u_showPairs: 0.0,
      u_showOrbits: 0.0,
      u_pointDensity: 0.0,
      u_colorA: "#1800ad",
      u_colorB: "#ff6633"
    }
  },

  scale: 0.5,
  rotation: [0, 0, 0],
  autoRotate: [0.1, 0.1, 0.1],

  effect: "../../../assets/sims/hadron_effect.js"
},

/* ============================================================
   7 — LÉPTONS
============================================================ */
{
  id: 7,
  nome: "Era dos Léptons",
  intervalo: "1 s – 3 min",
  descricao: `Plasma denso e luminoso dominado por elétrons e fótons.`,

  page: "../../pages/eras/7.html",

  sky: { uniforms: { u_intensity: 0.2 } },

  cube: {
    shader: "base",
    uniforms: {
      u_tint: "#ffffff",
      u_disp: 0.0,
      u_emissive: 1.0,
      u_showPlanck: 0.0,
      u_showPairs: 0.0,
      u_showOrbits: 0.0,
      u_pointDensity: 0.0,
      u_colorA: "#ff3131",
      u_colorB: "#ffde59"
    }
  },

  scale: 0.5,
  rotation: [0, 0, 0],
  autoRotate: [0.1, 0.1, 0.1],

  effect: "../../../assets/sims/lepton_effect.js"
},

/* ============================================================
   8 — NUCLEOSSÍNTESE
============================================================ */
{
  id: 8,
  nome: "Nucleossíntese Primordial",
  intervalo: "3 – 20 min",
  descricao: `Formação de núcleos leves.`,

  page: "../../pages/eras/8.html",

  sky: { uniforms: { u_intensity: 0.2 } },

  cube: {
    shader: "base",
    uniforms: {
      u_tint: "#ffffff",
      u_disp: 0.0,
      u_emissive: 1.0,
      u_showPlanck: 0.0,
      u_showPairs: 0.0,
      u_showOrbits: 0.0,
      u_pointDensity: 0.0,
      u_colorA: "#1800ad",
      u_colorB: "#ff6633"
    }
  },

  scale: 0.5,
  rotation: [0, 0, 0],
  autoRotate: [0.1, 0.1, 0.1],

  effect: "../../../assets/sims/nucleosynthesis_effect.js"
},

/* ============================================================
   9 — FÓTONS
============================================================ */
{
  id: 9,
  nome: "Era dos Fótons",
  intervalo: "20 min – 380 mil anos",
  descricao: `Plasma opaco.`,

  page: "../../pages/eras/9.html",

  sky: { uniforms: { u_intensity: 0.1 } },

  cube: {
    shader: "base",
    uniforms: {
      u_tint: "#000000",
      u_disp: 0.0,
      u_emissive: 1.0,
      u_showPlanck: 0.0,
      u_showPairs: 0.0,
      u_showOrbits: 0.0,
      u_pointDensity: 0.0,
      u_colorA: "#000000",
      u_colorB: "#ff6633"
    }
  },

  scale: 0.5,
  rotation: [0, 0, 0],
  autoRotate: [0.1, 0.1, 0.1],

  effect: "../../../assets/sims/photon_effect.js"
},

/* ============================================================
   10 — RECOMBINAÇÃO
============================================================ */
{
  id: 10,
  nome: "Recombinação",
  intervalo: "380 mil anos",
  descricao: `CMB se desacopla da matéria.`,

  page: "../../pages/eras/10.html",

  sky: { uniforms: { u_intensity: 0.22 } },

  cube: {
    shader: "base",
    uniforms: {
      u_tint: "#88CCFF",
      u_disp: 0.0,
      u_emissive: 1.0,
      u_showPlanck: 0.0,
      u_showPairs: 0.0,
      u_showOrbits: 0.0,
      u_pointDensity: 0.002,
      u_colorA: "#ff3131",
      u_colorB: "#ff6633"
    }
  },

  scale: 0.5,
  rotation: [0, 0, 0],
  autoRotate: [0.1, 0.1, 0.1],

  effect: "../../../assets/sims/recombination_effect.js"
},

/* ============================================================
   11 — TREVAS
============================================================ */
{
  id: 11,
  nome: "Era das Trevas",
  intervalo: "380 mil – 150 milhões de anos",
  descricao: `Sem estrelas, apenas matéria fria e tênue.`,

  page: "../../pages/eras/11.html",

  sky: { uniforms: { u_intensity: 0.1 } },

  cube: {
    shader: "base",
    uniforms: {
      u_tint: "#222233",
      u_disp: 0.0,
      u_emissive: 1.0,
      u_showPlanck: 0.0,
      u_showPairs: 0.0,
      u_showOrbits: 0.0,
      u_pointDensity: 0.01
    }
  },

  scale: 0.5,
  rotation: [0, 0, 0],
  autoRotate: [0.1, 0.1, 0.1],

  effect: "../../../assets/sims/dark_effect.js"
},

/* ============================================================
   12 — REIONIZAÇÃO
============================================================ */
{
  id: 12,
  nome: "Reionização e Primeiras Estrelas",
  intervalo: "150 milhões – 1 bilhão de anos",
  descricao: `Nascimento das primeiras estrelas (População III).`,

  page: "../../pages/eras/12.html",

  sky: { uniforms: { u_intensity: 0.001 } },

  cube: {
    shader: "base",
    uniforms: {
      u_tint: "#ffffff",
      u_disp: 0.0001,
      u_emissive: 1.0,
      u_showPlanck: 0.0,
      u_showPairs: 0.0,
      u_showOrbits: 1.0,
      u_pointDensity: 0.02,
      u_colorA: "#ff3131",
      u_colorB: "#ff751f"
    }
  },

  scale: 0.5,
  rotation: [0, 0, 0],
  autoRotate: [0.5, 1, 0.05],

  effect: "../../../assets/sims/reionization_effect.js"
},

/* ============================================================
   13 — GALÁXIAS
============================================================ */
{
  id: 13,
  nome: "Era das Galáxias",
  intervalo: "1 – 10 bilhões de anos",
  descricao: `Filamentos cósmicos, galáxias e clusters.`,

  page: "../../pages/eras/13.html",

  sky: { uniforms: { u_intensity: 0.0 } },

  cube: {
    shader: "base",
    uniforms: {
      u_tint: "#ffffff",
      u_disp: 0.001,
      u_emissive: 3.0,
      u_showPlanck: 0.0,
      u_showPairs: 0.0,
      u_showOrbits: 0.0,
      u_pointDensity: 0.,
      u_colorA: "#8c00ff",
      u_colorB: "#ff751f"
    }
  },

  scale: 0.1,
  rotation: [0, 0, 0],
  autoRotate: [0.5, 1, 0.3],

  effect: "../../../assets/sims/galaxy_effect.js" 
},

/* ============================================================
   14 — ESTELAR
============================================================ */
{
  id: 14,
  nome: "Era Estelar",
  intervalo: "1 bilhão – 100 trilhões de anos",
  descricao: `O Universo como o conhecemos e o somos`,

  page: "../../pages/eras/14.html",

  sky: { uniforms: { u_intensity: 0.0 } },

  cube: {
    shader: "base",
    uniforms: {
      u_tint: "#ffde59",
      u_disp: 0.00001,
      u_emissive: 2.0,
      u_showPlanck: 0.0,
      u_showPairs: 0.0,
      u_showOrbits: 1.0,
      u_pointDensity: 0.0
    }
  },

  scale: 1,
  rotation: [0, 0, 0],
  autoRotate: [0.1, 0.1, 0],

  effect: "../../../assets/sims/stellar_effect.js"
},

/* ============================================================
   15 — DECADÊNCIA ESTELAR
============================================================ */
{
  id: 15,
  nome: "Era da Decadência Estelar",
  intervalo: "100 trilhões – 10¹⁵ anos",
  descricao: `Formação estelar cessa; anãs brancas dominam.`,

  page: "../../pages/eras/15.html",

  sky: { uniforms: { u_intensity: 0.1 } },

  cube: {
    shader: "base",
    uniforms: {
      u_tint: "#ffffff",
      u_disp: 0.00001,
      u_emissive: 1.0,
      u_showPlanck: 0.0,
      u_showPairs: 0.0,
      u_showOrbits: 0.0,
      u_pointDensity: 0.003,
      u_colorA: "#8c00ff",
      u_colorB: "#ff751f"
    }
  },

  scale: 0.5,
  rotation: [0, 0, 0],
  autoRotate: [0.5, 1, 0.05],

  effect: "../../../assets/sims/whiteDwarf_effect.js"
},

/* ============================================================
   16 — ERA DOS BURACOS NEGROS
============================================================ */
{
  id: 16,
  nome: "Era dos Buracos Negros",
  intervalo: "10¹⁵ – 10¹⁰⁰ anos",
  descricao: `Evaporação lenta; domínio gravitacional extremo.`,

  page: "../../pages/eras/16.html",

  sky: { uniforms: { u_intensity: 0.05 } },

  cube: {
    shader: "base",
    uniforms: {
      u_tint: "#000000",
      u_disp: 0.0,
      u_emissive: 1.0,
      u_showPlanck: 0.0,
      u_showPairs: 0.0,
      u_showOrbits: 0.5,
      u_pointDensity: 0.001,
      u_colorA: "#ff3131",
      u_colorB: "#ff751f"
    }
  },

  scale: 0.6,
  rotation: [0, 0, 0],
  autoRotate: [0, -1, -1],

  effect: "../../../assets/sims/blackhole_effect.js"
},

/* ============================================================
   17 — MORTE TÉRMICA
============================================================ */
{
  id: 17,
  nome: "Era da Morte Térmica",
  intervalo: "Após 10¹⁰⁰ anos",
  descricao: `Equilíbrio térmico absoluto. Nada acontece.`,

  page: "../../pages/eras/17.html",
  
  sky: { uniforms: { u_intensity: 0.02 } },

  cube: {
    shader: "base",
    uniforms: {
      u_tint: "#222233",
      u_disp: 0.0,
      u_emissive: 1.0,
      u_showPlanck: 0.0,
      u_showPairs: 0.0,
      u_showOrbits: 0.0,
      u_pointDensity: 0.002
    }
  },

  scale: 1,
  rotation: [0, 0, 0],
  autoRotate: [0, 0, 0],

  effect: "../../../assets/sims/end_effect.js"
},

];
