// Roteador de abas. Renderiza o conteudo da aba selecionada assincronamente
// buscando dados na API. Atende ao requisito "navegacao assincrona, sem recarregar
// o navegador" do trabalho semestral.

const Abas = (() => {
    let pacienteAtual = null;
    let abaAtual = "historico";

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
            else ligarEnhancerExtras(aba, pacienteAtual);
        } catch (ex) {
            cont.innerHTML = `<p class="msg-erro">${ex.message}</p>`;
        }
    }

    // Renderers retornam HTML como string.
    const renderers = {
        async historico(p) {
            return typeof Timeline !== "undefined"
                ? await Timeline.renderAba(p)
                : `<p class="vazio">Timeline indisponível.</p>`;
        },
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
                        <div class="item-acoes">
                            <button class="btn-mini btn-mini-delete" data-deletar-fixo data-id="${a.id}" title="Excluir">🗑</button>
                            <span class="seta">›</span>
                        </div>
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
                ? `<p class="vazio">Nenhuma solicitação de exames.</p>`
                : `<ul class="lista-itens">${lista.map(s => `
                    <li class="clicavel" data-ver="exame" data-id="${s.id}">
                        <div class="item-info">
                            <div class="item-titulo">${formatarData(s.data)}</div>
                            <div class="item-meta">${s.exames.map(e => `${e.categoria} — ${e.nome}`).join("<br>")}</div>
                        </div>
                        <div class="item-acoes">
                            <button class="btn-mini btn-mini-delete" data-deletar-fixo data-id="${s.id}" title="Excluir">🗑</button>
                            <span class="seta">›</span>
                        </div>
                    </li>`).join("")}</ul>`;
            return `
                <div class="toolbar-aba">
                    <h3>Exames solicitados</h3>
                    <button class="btn btn-primary" id="btn-nova-solicitacao">+ Nova solicitação</button>
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
                        <div class="item-acoes">
                            <button class="btn-mini btn-mini-delete" data-deletar-fixo data-id="${a.id}" title="Excluir">🗑</button>
                            <span class="seta">›</span>
                        </div>
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
            // Tenta render via AbasExtras (vacinas, prescricoes, retornos, etc).
            if (typeof AbasExtras !== "undefined" && AbasExtras.TIPOS[abaAtual]) {
                return await AbasExtras.renderAba(abaAtual, p);
            }
            return `
                <div class="bloco">
                    <h3>Em desenvolvimento</h3>
                    <p>Módulo "${abaAtual}" disponível apenas via API neste momento.</p>
                </div>
            `;
        }
    };

    function ligarClicksDeVer() {
        document.querySelectorAll("li.clicavel[data-ver]").forEach(li => {
            li.addEventListener("click", e => {
                if (e.target.closest("[data-deletar-fixo]")) return;
                const tipo = li.dataset.ver;
                const id = li.dataset.id;
                if (tipo === "anamnese") Modais.verAnamnese(id);
                else if (tipo === "exame") Modais.verExame(id);
                else if (tipo === "atestado") Modais.verAtestado(id);
            });
        });

        const recursoPorTipo = { anamnese: "anamneses", exame: "exames", atestado: "atestados" };
        document.querySelectorAll("[data-deletar-fixo]").forEach(btn => {
            btn.addEventListener("click", async e => {
                e.stopPropagation();
                if (!confirm("Excluir este registro? Esta ação não pode ser desfeita.")) return;
                const li = btn.closest("[data-ver]");
                const recurso = recursoPorTipo[li.dataset.ver];
                try {
                    await API.remover(recurso, btn.dataset.id);
                    Abas.trocar(li.dataset.ver === "exame" ? "exames"
                              : li.dataset.ver === "atestado" ? "atestados"
                              : "anamnese");
                } catch (ex) {
                    alert(ex.message);
                }
            });
        });
    }

    // Handlers que precisam ser ligados depois do innerHTML.
    const enhancers = {
        historico(p) {
            if (typeof Timeline !== "undefined") Timeline.ligarHandlers(p);
        },
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

    // Para qualquer aba do AbasExtras, liga os handlers.
    function ligarEnhancerExtras(aba, p) {
        if (typeof AbasExtras !== "undefined" && AbasExtras.TIPOS[aba]) {
            AbasExtras.ligarHandlers(p);
        }
    }

    function registrarEnhancer(aba, fn) { enhancers[aba] = fn; }

    function formatarData(iso) {
        if (!iso) return "—";
        const d = new Date(iso);
        return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
    }

    function formatarTipo(t) {
        return ({
            TermoExames: "Termo para Realização de Exames",
            TermoProcedimentoRisco: "Termo para Procedimento Terapêutico de Risco",
            TermoObito: "Termo de Óbito",
            TermoEutanasia: "Termo para Realização de Eutanásia",
            TermoCirurgico: "Termo para Procedimentos Cirúrgicos",
            TermoRetiradaSemAlta: "Termo para Retirada sem Alta",
            AtestadoEncaminhamento: "Atestado de Encaminhamento"
        })[t] || t;
    }

    return { init, setPaciente, trocar, registrarEnhancer };
})();
