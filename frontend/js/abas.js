// Roteador de abas. Renderiza o conteudo da aba selecionada assincronamente
// buscando dados na API. Atende ao requisito "navegacao assincrona, sem recarregar
// o navegador" do trabalho semestral.

const Abas = (() => {
    let pacienteAtual = null;
    let abaAtual = "anamnese";

    function init() {
        document.querySelectorAll(".aba").forEach(btn => {
            btn.addEventListener("click", () => trocar(btn.dataset.aba));
        });
    }

    function setPaciente(p) {
        pacienteAtual = p;
        trocar(abaAtual);
    }

    async function trocar(aba) {
        abaAtual = aba;
        document.querySelectorAll(".aba").forEach(b => {
            b.classList.toggle("ativa", b.dataset.aba === aba);
        });
        const cont = document.getElementById("aba-conteudo");
        cont.innerHTML = `<p class="vazio">Carregando ${aba}...</p>`;

        if (!pacienteAtual) {
            cont.innerHTML = `<p class="vazio">Selecione um paciente.</p>`;
            return;
        }

        try {
            const render = renderers[aba] || renderers.default;
            cont.innerHTML = await render(pacienteAtual);
            const enhancer = enhancers[aba];
            if (enhancer) enhancer(pacienteAtual);
        } catch (ex) {
            cont.innerHTML = `<p class="msg-erro">${ex.message}</p>`;
        }
    }

    // Renderers retornam HTML como string. Integracao real com a API
    // (criar/editar/listar dinamicamente) entra no proximo commit.
    const renderers = {
        async anamnese(p) {
            const lista = await API.listarAnamneses(p.id).catch(() => []);
            const itens = lista.length === 0
                ? `<p class="vazio">Nenhuma anamnese registrada.</p>`
                : `<ul class="lista-itens">${lista.map(a => `
                    <li class="clicavel" data-ver="anamnese" data-id="${a.id}">
                        <div class="item-info">
                            <div class="item-titulo">Anamnese de ${formatarData(a.criadoEm)}</div>
                            <div class="item-meta">${a.queixaPrincipal || "Sem queixa registrada"}</div>
                        </div>
                        <div class="item-acoes"><span class="seta">›</span></div>
                    </li>`).join("")}</ul>`;
            return `
                <div class="toolbar-aba">
                    <h3>Anamneses</h3>
                    <button class="btn btn-primary" id="btn-nova-anamnese">+ Nova anamnese</button>
                </div>
                ${itens}
            `;
        },
        async exames(p) {
            const lista = await API.listarExames(p.id).catch(() => []);
            const itens = lista.length === 0
                ? `<p class="vazio">Nenhuma solicitacao de exames.</p>`
                : `<ul class="lista-itens">${lista.map(s => `
                    <li class="clicavel" data-ver="exame" data-id="${s.id}">
                        <div class="item-info">
                            <div class="item-titulo">${formatarData(s.data)}</div>
                            <div class="item-meta">${s.exames.map(e => `${e.categoria} — ${e.nome}`).join("<br>")}</div>
                        </div>
                        <div class="item-acoes"><span class="seta">›</span></div>
                    </li>`).join("")}</ul>`;
            return `
                <div class="toolbar-aba">
                    <h3>Exames solicitados</h3>
                    <button class="btn btn-primary" id="btn-nova-solicitacao">+ Nova solicitacao</button>
                </div>
                ${itens}
            `;
        },
        async atestados(p) {
            const lista = await API.listarAtestados(p.id).catch(() => []);
            const itens = lista.length === 0
                ? `<p class="vazio">Nenhum atestado ou termo criado.</p>`
                : `<ul class="lista-itens">${lista.map(a => `
                    <li class="clicavel" data-ver="atestado" data-id="${a.id}">
                        <div class="item-info">
                            <div class="item-titulo">${formatarTipo(a.tipo)}</div>
                            <div class="item-meta">Emitido em ${formatarData(a.dataEmissao)} · ${a.cidade || "—"}</div>
                        </div>
                        <div class="item-acoes"><span class="seta">›</span></div>
                    </li>`).join("")}</ul>`;
            return `
                <div class="toolbar-aba">
                    <h3>Atestados e Termos</h3>
                    <button class="btn btn-primary" id="btn-novo-atestado">+ Novo atestado ou termo</button>
                </div>
                ${itens}
            `;
        },
        async default(p) {
            return `
                <div class="bloco">
                    <h3>Em desenvolvimento</h3>
                    <p>Modulo "${abaAtual}" disponivel apenas via API neste momento.</p>
                </div>
            `;
        }
    };

    function ligarClicksDeVer() {
        document.querySelectorAll("li.clicavel[data-ver]").forEach(li => {
            li.addEventListener("click", () => {
                const tipo = li.dataset.ver;
                const id = li.dataset.id;
                if (tipo === "anamnese") Modais.verAnamnese(id);
                else if (tipo === "exame") Modais.verExame(id);
                else if (tipo === "atestado") Modais.verAtestado(id);
            });
        });
    }

    // Handlers que precisam ser ligados depois do innerHTML.
    const enhancers = {
        anamnese(p) {
            document.getElementById("btn-nova-anamnese")?.addEventListener("click",
                () => Modais.novaAnamnese(p));
            ligarClicksDeVer();
        },
        exames(p) {
            document.getElementById("btn-nova-solicitacao")?.addEventListener("click",
                () => Modais.novaSolicitacao(p));
            ligarClicksDeVer();
        },
        atestados(p) {
            document.getElementById("btn-novo-atestado")?.addEventListener("click",
                () => Modais.novoAtestado(p));
            ligarClicksDeVer();
        }
    };

    function registrarEnhancer(aba, fn) { enhancers[aba] = fn; }

    function formatarData(iso) {
        if (!iso) return "—";
        const d = new Date(iso);
        return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
    }

    function formatarTipo(t) {
        return ({
            TermoExames: "Termo para Realizacao de Exames",
            TermoProcedimentoRisco: "Termo para Procedimento Terapeutico de Risco",
            TermoObito: "Termo de Obito",
            TermoEutanasia: "Termo para Realizacao de Eutanasia",
            TermoCirurgico: "Termo para Procedimentos Cirurgicos",
            TermoRetiradaSemAlta: "Termo para Retirada sem Alta",
            AtestadoEncaminhamento: "Atestado de Encaminhamento"
        })[t] || t;
    }

    return { init, setPaciente, trocar, registrarEnhancer };
})();
