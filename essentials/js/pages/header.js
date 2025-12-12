(function(){

  const hamburger = document.getElementById('hamburger-btn');
  const panelButtons = document.querySelectorAll('.panel-btn');

  if (!hamburger) return;

  hamburger.addEventListener('click', () => {

    try {
      if (parent && typeof parent.toggleSidePanel === "function") {
        parent.toggleSidePanel();
      }
    } catch (err) {
      console.warn("Não foi possível acessar o painel global:", err);
    }

    hamburger.classList.toggle('active');
  });


  panelButtons.forEach(btn => {

    btn.addEventListener('click', () => {

      const target = btn.getAttribute("data-target");
      if (!target) return;

      try {

        const frame = parent.document.querySelector('iframe[name="conteudo"]');
        if (frame) frame.src = target;

        if (typeof parent.toggleSidePanel === "function") {
          parent.toggleSidePanel();
        }

      } catch(err) {
        console.warn("Erro ao acessar iframe do pai:", err);
      }

    });

  });


  document.addEventListener("click", (ev) => {

    const path = ev.composedPath ? ev.composedPath() : [];

    const clickedInsideHeader =
      path.includes(hamburger) ||
      path.some(n => n && n.classList && n.classList.contains("panel-btn"));

    if (!clickedInsideHeader) {

      try {
        if (typeof parent.closeSidePanel === "function") {
          parent.closeSidePanel();
        }
      } catch (err) {
        console.warn("Erro ao tentar fechar painel global:", err);
      }

      hamburger.classList.remove('active');
    }

  });

})();
