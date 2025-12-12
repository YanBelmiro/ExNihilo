emailjs.init("odQILsf84BlWIPZeV");

document.getElementById("contact-form").addEventListener("submit", function(e) {
    e.preventDefault();

    const status = document.getElementById("form-status");
    status.textContent = "Enviando...";

    emailjs.sendForm("service_utkd4dm", "template_0htufh4", "#contact-form")
        .then(() => {
            status.textContent = "Mensagem enviada.";
            status.style.color = "var(--cosmos-yellow)";
            document.getElementById("contact-form").reset();
        })
        .catch(() => {
            status.textContent = "Erro ao enviar.";
            status.style.color = "var(--cosmos-red)";
        });
});
