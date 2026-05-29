// Timeline unificada do paciente. Busca anamneses, vacinas, exames, atestados,
// prescricoes, retornos, procedimentos, cirurgias e internacoes em paralelo,
// normaliza cada um num evento ({tipo, data, titulo, resumo}) e ordena por data
// decrescente. Cada evento eh clicavel e abre o modal de detalhe correspondente.

const Timeline = (() => {

    function fmt(iso) {
        if (!iso) return "—";
        return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
    }

    const TIPOS_VISUAL = {
        anamnese:     { icone: "📋", cor: "#4a3b5c", rotulo: "Anamnese" },
        vacina:       { icone: "💉", cor: "#5c8c6a", rotulo: "Vacina" },
        exame:        { icone: "🔬", cor: "#3d6c9e", rotulo: "Exame" },
        atestado:     { icone: "📄", cor: "#6a5a7d", rotulo: "Atestado/Termo" },
        prescricao:   { icone: "💊", cor: "#b35c43", rotulo: "Prescrição" },
        retorno:      { icone: "📅", cor: "#9e8e4f", rotulo: "Retorno" },
        procedimento: { icone: "⚕️", cor: "#5c7a8c", rotulo: "Procedimento" },
        cirurgia:     { icone: "🔪", cor: "#b94759", rotulo: "Cirurgia" },
        internacao:   { icone: "🏥", cor: "#7a4f9e", rotulo: "Internação" }
    };

    async function carregar(paciente) {
        const id = paciente.id;
        const seguro = p => p.catch(() => []);

        const [anamneses, vacinas, exames, atestados, prescricoes, retornos, procedimentos, cirurgias, internacoes] =
            await Promise.all([
                seguro(API.listarAnamneses(id)),
                seguro(API.listar("vacinas", id)),
                seguro(API.listarExames(id)),
                seguro(API.listarAtestados(id)),
                seguro(API.listar("prescricoes", id)),
                seguro(API.listar("retornos", id)),
                seguro(API.listar("procedimentos", id)),
                seguro(API.listar("cirurgias", id)),
                seguro(API.listar("internacoes", id))
            ]);

        const eventos = [
            ...anamneses.map(a => ({
                tipo: "anamnese", data: a.criadoEm, id: a.id,
                titulo: "Anamnese realizada",
                resumo: a.queixaPrincipal || a.diagnostico || "Sem queixa registrada"
            })),
            ...vacinas.map(v => ({
                tipo: "vacina", data: v.dataAplicacao, id: v.id,
                titulo: v.nome,
                resumo: `${v.dose || ""}${v.fabricante ? ` · ${v.fabricante}` : ""}${v.proximaDose ? ` · próxima ${fmt(v.proximaDose)}` : ""}`
            })),
            ...exames.map(e => ({
                tipo: "exame", data: e.data, id: e.id,
                titulo: "Exames solicitados",
                resumo: (e.exames || []).map(x => x.nome).join(", ") || "—"
            })),
            ...atestados.map(a => ({
                tipo: "atestado", data: a.dataEmissao, id: a.id,
                titulo: tituloAtestado(a.tipo),
                resumo: a.cidade ? `Emitido em ${a.cidade}` : "Atestado emitido"
            })),
            ...prescricoes.map(p => ({
                tipo: "prescricao", data: p.data, id: p.id,
                titulo: "Prescrição",
                resumo: (p.itens || []).map(i => i.medicamento).join(", ") || "—"
            })),
            ...retornos.map(r => ({
                tipo: "retorno", data: r.dataAgendada, id: r.id,
                titulo: r.realizado ? "Retorno realizado" : "Retorno agendado",
                resumo: r.motivo || "—"
            })),
            ...procedimentos.map(p => ({
                tipo: "procedimento", data: p.data, id: p.id,
                titulo: p.nome,
                resumo: p.descricao || "—"
            })),
            ...cirurgias.map(c => ({
                tipo: "cirurgia", data: c.dataAgendada, id: c.id,
                titulo: c.tipo,
                resumo: `Status: ${c.status}${c.observacoes ? ` · ${c.observacoes}` : ""}`
            })),
            ...internacoes.map(i => ({
                tipo: "internacao", data: i.entrada, id: i.id,
                titulo: i.saida ? "Internação encerrada" : "Internação em curso",
                resumo: i.motivo || "—"
            }))
        ];

        eventos.sort((a, b) => new Date(b.data) - new Date(a.data));
        return eventos;
    }

    function tituloAtestado(tipo) {
        return ({
            TermoExames: "Termo para Realização de Exames",
            TermoProcedimentoRisco: "Termo para Procedimento Terapêutico de Risco",
            TermoObito: "Termo de Óbito",
            TermoEutanasia: "Termo para Realização de Eutanásia",
            TermoCirurgico: "Termo para Procedimentos Cirúrgicos",
            TermoRetiradaSemAlta: "Termo para Retirada sem Alta",
            AtestadoEncaminhamento: "Atestado de Encaminhamento"
        })[tipo] || "Atestado";
    }

    function renderHtml(eventos) {
        if (eventos.length === 0) {
            return `
                <div class="vazio" style="padding:40px">
                    <p>Nenhum evento registrado para este paciente.</p>
                    <p style="font-size:13px;margin-top:6px">Cadastre uma anamnese, vacina ou exame para começar.</p>
                </div>
            `;
        }

        const itens = eventos.map(e => {
            const v = TIPOS_VISUAL[e.tipo];
            return `
                <li class="timeline-item" data-tipo="${e.tipo}" data-id="${e.id}">
                    <div class="timeline-dot" style="background:${v.cor}">
                        <span>${v.icone}</span>
                    </div>
                    <div class="timeline-card">
                        <div class="timeline-card-header">
                            <span class="timeline-rotulo" style="color:${v.cor}">${v.rotulo}</span>
                            <span class="timeline-data">${fmt(e.data)}</span>
                        </div>
                        <div class="timeline-titulo">${e.titulo}</div>
                        <div class="timeline-resumo">${e.resumo}</div>
                    </div>
                </li>
            `;
        }).join("");

        return `
            <div class="toolbar-aba">
                <h3>Linha do tempo</h3>
                <small style="color:var(--texto-suave)">${eventos.length} evento(s)</small>
            </div>
            <ul class="timeline">${itens}</ul>
        `;
    }

    function ligarHandlers(paciente) {
        document.querySelectorAll(".timeline-item").forEach(li => {
            li.addEventListener("click", () => abrirDetalhe(li.dataset.tipo, li.dataset.id, paciente));
        });
    }

    function abrirDetalhe(tipo, id, paciente) {
        // Reutiliza os modais existentes.
        if (tipo === "anamnese") return Modais.verAnamnese(id);
        if (tipo === "exame")    return Modais.verExame(id);
        if (tipo === "atestado") return Modais.verAtestado(id);

        // Mapeia tipos do timeline para abas do AbasExtras.
        const mapaAba = {
            vacina: "vacinas",
            prescricao: "prescricoes",
            retorno: "retornos",
            procedimento: "procedimentos",
            cirurgia: "cirurgias",
            internacao: "internacoes"
        };
        const aba = mapaAba[tipo];
        if (aba && typeof AbasExtras !== "undefined") {
            const tp = AbasExtras.TIPOS[aba];
            if (tp) {
                // Replica abrirVer do AbasExtras inline (nao eh exportado).
                API.obter(tp.recurso, id).then(item => {
                    Modais.abrir(`
                        <h2>${tp.tituloVer}</h2>
                        <div class="bloco">${tp.detalhe(item)}</div>
                        <div class="modal-acoes">
                            <button class="btn btn-secundario" data-fechar-modal>Fechar</button>
                        </div>
                    `);
                }).catch(ex => alert(ex.message));
            }
        }
    }

    async function renderAba(paciente) {
        try {
            const eventos = await carregar(paciente);
            return renderHtml(eventos);
        } catch (ex) {
            return `<p class="msg-erro">${ex.message}</p>`;
        }
    }

    return { renderAba, ligarHandlers };
})();
