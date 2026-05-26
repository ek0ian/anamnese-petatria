// Bootstrap da aplicacao. Carrega lista de pacientes na sidebar, conecta busca
// e troca de paciente. Tudo assincrono via fetch (nao recarrega o navegador).

const App = (() => {
    let pacienteSelecionado = null;
    let timerBusca = null;

    function iniciar() {
        Abas.init();
        document.getElementById("input-busca").addEventListener("input", onBusca);
        document.getElementById("btn-novo-paciente").addEventListener("click", () => Modais.novoPaciente());
        document.getElementById("btn-whatsapp").addEventListener("click", abrirWhatsapp);
        carregarPacientes();
    }

    function abrirWhatsapp() {
        // Abre o WhatsApp Web filtrando pelo nome do tutor selecionado.
        if (!pacienteSelecionado) {
            alert("Selecione um paciente primeiro.");
            return;
        }
        window.open("https://web.whatsapp.com/", "_blank");
    }

    async function carregarPacientes(busca) {
        const ul = document.getElementById("ul-pacientes");
        ul.innerHTML = `<li class="vazio" style="padding:14px">Carregando...</li>`;
        try {
            const lista = await API.listarPacientes(busca);
            if (lista.length === 0) {
                ul.innerHTML = `<li class="vazio" style="padding:14px">Nenhum paciente encontrado.</li>`;
                return;
            }
            ul.innerHTML = lista.map(p => `
                <li data-id="${p.id}">
                    <div class="li-nome">${p.nome}</div>
                    <div class="li-meta">ID ${p.codigo} · ${p.raca || p.especie} · ${p.tutorNome || ""}</div>
                </li>
            `).join("");
            ul.querySelectorAll("li[data-id]").forEach(li => {
                li.addEventListener("click", () => selecionar(li.dataset.id));
            });
        } catch (ex) {
            ul.innerHTML = `<li class="msg-erro" style="margin:14px">${ex.message}</li>`;
        }
    }

    function onBusca(e) {
        clearTimeout(timerBusca);
        const termo = e.target.value.trim();
        timerBusca = setTimeout(() => carregarPacientes(termo || undefined), 250);
    }

    async function selecionar(id) {
        document.querySelectorAll("#ul-pacientes li").forEach(li => {
            li.classList.toggle("selecionado", li.dataset.id === id);
        });

        document.getElementById("painel-vazio").hidden = true;
        document.getElementById("painel-conteudo").hidden = false;

        try {
            const p = await API.obterPaciente(id);
            pacienteSelecionado = p;
            preencherCardPaciente(p);
            Abas.setPaciente(p);
        } catch (ex) {
            alert(ex.message);
        }
    }

    function preencherCardPaciente(p) {
        document.getElementById("paciente-nome").textContent = p.nome;
        document.getElementById("paciente-codigo").textContent = p.codigo;
        document.getElementById("paciente-raca").textContent = p.raca || p.especie;
        document.getElementById("paciente-idade").textContent = p.idadeFormatada || "—";
        document.getElementById("paciente-tutor").textContent = p.tutorNome || "—";
        document.getElementById("paciente-icone").textContent =
            p.especie === "Felino" ? "🐈" : (p.especie === "Canino" ? "🐕" : "🐾");
    }

    return { iniciar, carregarPacientes };
})();

// Inicializa Auth (que mostra login ou app)
document.addEventListener("DOMContentLoaded", () => {
    Auth.init();
});
