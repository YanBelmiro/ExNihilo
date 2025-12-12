
  function toggleSidePanel() {
      const panel = document.getElementById("side-panel");
      const state = panel.classList.toggle("open");
      return state;
  }

  function closeSidePanel() {
      document.getElementById("side-panel").classList.remove("open");
  }

  document.addEventListener("DOMContentLoaded", () => {
      const buttons = document.querySelectorAll("#side-panel .panel-btn");

      buttons.forEach(btn => {
          btn.addEventListener("click", () => {
              const target = btn.dataset.target;
              const iframe = document.querySelector('iframe[name="conteudo"]');

              if (iframe && target) iframe.src = target;

              closeSidePanel();
          });
      });
  });

