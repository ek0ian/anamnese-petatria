// Renderers e modais para as abas que usam o CRUD generico do backend.
// Cada entidade declara: recurso (rota), titulo, colunas para listagem,
// campos do formulario e funcao de extracao do payload.

const AbasExtras = (() => {

    function fmtData(iso) {
        if (!iso) return "—";
        return new Date(iso).toLocaleDateString("pt-BR");
    }

    function inputDate(name, valor, label) {
        const v = valor ? new Date(valor).toISOString().slice(0, 10) : "";
        return `<label>${label}<input type="date" name="${name}" value="${v}" /></label>`;
    }

    function inputTexto(name, valor, label, tipo = "text") {
        return `<label>${label}<input type="${tipo}" name="${name}" value="${valor || ""}" /></label>`;
    }

    function inputArea(name, valor, label) {
        return `<label>${label}<textarea name="${name}" rows="3">${valor || ""}</textarea></label>`;
    }

    /* ============ Definicao por aba ============ */
    const TIPOS = {
        vacinas: {
            recurso: "vacinas",
            tituloLista: "Vacinas aplicadas",
            tituloNovo: "Nova vacina",
            tituloVer: "Vacina",
            colunas: v => ({
                titulo: `${v.nome}${v.dose ? ` · ${v.dose}` : ""}`,
                meta: `Aplicada em ${fmtData(v.dataAplicacao)}${v.proximaDose ? ` · proxima ${fmtData(v.proximaDose)}` : ""}`
            }),
            form: v => `
                <div class="grid-2">
                    ${inputTexto("nome", v?.nome, "Nome da vacina")}
                    ${inputTexto("dose", v?.dose, "Dose")}
                    ${inputTexto("fabricante", v?.fabricante, "Fabricante")}
                    ${inputTexto("lote", v?.lote, "Lote")}
                    ${inputDate("dataAplicacao", v?.dataAplicacao, "Data de aplicacao")}
                    ${inputDate("proximaDose", v?.proximaDose, "Proxima dose")}
                </div>
                ${inputArea("observacoes", v?.observacoes, "Observacoes")}
            `,
            payload: (f, pacienteId) => ({
                pacienteId,
                nome: f.nome.value,
                dose: f.dose.value,
                fabricante: f.fabricante.value,
                lote: f.lote.value,
                dataAplicacao: f.dataAplicacao.value ? new Date(f.dataAplicacao.value).toISOString() : new Date().toISOString(),
                proximaDose: f.proximaDose.value ? new Date(f.proximaDose.value).toISOString() : null,
                observacoes: f.observacoes.value
            }),
            detalhe: v => `
                ${Modais.linha("Nome", v.nome)}
                ${Modais.linha("Dose", v.dose)}
                ${Modais.linha("Fabricante", v.fabricante)}
                ${Modais.linha("Lote", v.lote)}
                ${Modais.linha("Data de aplicacao", fmtData(v.dataAplicacao))}
                ${v.proximaDose ? Modais.linha("Proxima dose", fmtData(v.proximaDose)) : ""}
                ${Modais.linha("Observacoes", v.observacoes)}
            `
        },

        prescricoes: {
            recurso: "prescricoes",
            tituloLista: "Prescricoes",
            tituloNovo: "Nova prescricao",
            tituloVer: "Prescricao",
            colunas: p => ({
                titulo: `Prescricao de ${fmtData(p.data)}`,
                meta: `${(p.itens || []).length} medicamento(s)`
            }),
            form: p => `
                ${inputDate("data", p?.data || new Date(), "Data")}
                <div class="bloco">
                    <h3>Medicamentos</h3>
                    <div id="itens-prescricao">
                        ${((p?.itens) || [{}]).map((it, i) => itemPrescricaoHtml(it, i)).join("")}
                    </div>
                    <button type="button" class="btn btn-secundario" id="btn-add-item">+ Adicionar medicamento</button>
                </div>
                ${inputArea("orientacoes", p?.orientacoes, "Orientacoes ao tutor")}
            `,
            payload: (f, pacienteId) => {
                const itens = [];
                f.querySelectorAll(".item-prescricao").forEach(div => {
                    const med = div.querySelector("[name=medicamento]").value;
                    if (!med) return;
                    itens.push({
                        medicamento: med,
                        dose: div.querySelector("[name=dose]").value,
                        via: div.querySelector("[name=via]").value,
                        frequencia: div.querySelector("[name=frequencia]").value,
                        duracao: div.querySelector("[name=duracao]").value
                    });
                });
                return {
                    pacienteId,
                    data: f.data.value ? new Date(f.data.value).toISOString() : new Date().toISOString(),
                    itens,
                    orientacoes: f.orientacoes.value
                };
            },
            detalhe: p => `
                ${Modais.linha("Data", fmtData(p.data))}
                <div class="bloco">
                    <h3>Medicamentos</h3>
                    <ul style="padding-left:18px">
                        ${(p.itens || []).map(i => `
                            <li>
                                <strong>${i.medicamento}</strong>
                                ${i.dose ? ` — ${i.dose}` : ""}
                                ${i.via ? ` · ${i.via}` : ""}
                                ${i.frequencia ? ` · ${i.frequencia}` : ""}
                                ${i.duracao ? ` · ${i.duracao}` : ""}
                            </li>
                        `).join("")}
                    </ul>
                </div>
                ${Modais.linha("Orientacoes", p.orientacoes)}
            `,
            // Hook chamado depois que o form e renderizado.
            depoisDeAbrir: () => {
                document.getElementById("btn-add-item")?.addEventListener("click", () => {
                    const cont = document.getElementById("itens-prescricao");
                    const i = cont.children.length;
                    cont.insertAdjacentHTML("beforeend", itemPrescricaoHtml({}, i));
                });
            }
        },

        retornos: {
            recurso: "retornos",
            tituloLista: "Retornos agendados",
            tituloNovo: "Novo retorno",
            tituloVer: "Retorno",
            colunas: r => ({
                titulo: `Retorno em ${fmtData(r.dataAgendada)}`,
                meta: `${r.realizado ? "Realizado" : "Pendente"}${r.motivo ? ` · ${r.motivo}` : ""}`
            }),
            form: r => `
                ${inputDate("dataAgendada", r?.dataAgendada, "Data do retorno")}
                ${inputArea("motivo", r?.motivo, "Motivo do retorno")}
                <div class="checkbox-grupo">
                    <label><input type="checkbox" name="realizado" ${r?.realizado ? "checked" : ""}/> Ja foi realizado</label>
                </div>
            `,
            payload: (f, pacienteId) => ({
                pacienteId,
                dataAgendada: f.dataAgendada.value ? new Date(f.dataAgendada.value).toISOString() : new Date().toISOString(),
                motivo: f.motivo.value,
                realizado: f.realizado.checked
            }),
            detalhe: r => `
                ${Modais.linha("Data agendada", fmtData(r.dataAgendada))}
                ${Modais.linha("Motivo", r.motivo)}
                ${Modais.linha("Realizado", r.realizado)}
            `
        },

        medicamentos: {
            // "Medicamentos" no UI = atalho para Prescricoes (mesmo recurso, mesma logica).
            ...null,
            recurso: "prescricoes",
            tituloLista: "Medicamentos prescritos",
            tituloNovo: "Nova prescricao",
            tituloVer: "Prescricao",
            colunas: p => ({
                titulo: `Prescricao de ${fmtData(p.data)}`,
                meta: (p.itens || []).map(i => i.medicamento).join(", ") || "—"
            }),
            form: p => TIPOS.prescricoes.form(p),
            payload: (f, pacienteId) => TIPOS.prescricoes.payload(f, pacienteId),
            detalhe: p => TIPOS.prescricoes.detalhe(p),
            depoisDeAbrir: () => TIPOS.prescricoes.depoisDeAbrir()
        },

        procedimentos: {
            recurso: "procedimentos",
            tituloLista: "Procedimentos realizados",
            tituloNovo: "Novo procedimento",
            tituloVer: "Procedimento",
            colunas: p => ({
                titulo: p.nome,
                meta: fmtData(p.data)
            }),
            form: p => `
                ${inputTexto("nome", p?.nome, "Nome do procedimento")}
                ${inputDate("data", p?.data, "Data")}
                ${inputArea("descricao", p?.descricao, "Descricao")}
            `,
            payload: (f, pacienteId) => ({
                pacienteId,
                nome: f.nome.value,
                data: f.data.value ? new Date(f.data.value).toISOString() : new Date().toISOString(),
                descricao: f.descricao.value
            }),
            detalhe: p => `
                ${Modais.linha("Nome", p.nome)}
                ${Modais.linha("Data", fmtData(p.data))}
                ${Modais.linha("Descricao", p.descricao)}
            `
        },

        cirurgias: {
            recurso: "cirurgias",
            tituloLista: "Cirurgias",
            tituloNovo: "Nova cirurgia",
            tituloVer: "Cirurgia",
            colunas: c => ({
                titulo: c.tipo,
                meta: `${fmtData(c.dataAgendada)} · ${c.status}`
            }),
            form: c => `
                ${inputTexto("tipo", c?.tipo, "Tipo de cirurgia")}
                ${inputDate("dataAgendada", c?.dataAgendada, "Data agendada")}
                <label>Status
                    <select name="status">
                        <option value="agendada" ${c?.status === "agendada" ? "selected" : ""}>Agendada</option>
                        <option value="realizada" ${c?.status === "realizada" ? "selected" : ""}>Realizada</option>
                        <option value="cancelada" ${c?.status === "cancelada" ? "selected" : ""}>Cancelada</option>
                    </select>
                </label>
                ${inputArea("observacoes", c?.observacoes, "Observacoes")}
            `,
            payload: (f, pacienteId) => ({
                pacienteId,
                tipo: f.tipo.value,
                dataAgendada: f.dataAgendada.value ? new Date(f.dataAgendada.value).toISOString() : new Date().toISOString(),
                status: f.status.value,
                observacoes: f.observacoes.value
            }),
            detalhe: c => `
                ${Modais.linha("Tipo", c.tipo)}
                ${Modais.linha("Data agendada", fmtData(c.dataAgendada))}
                ${Modais.linha("Status", c.status)}
                ${Modais.linha("Observacoes", c.observacoes)}
            `
        },

        internacoes: {
            recurso: "internacoes",
            tituloLista: "Internacoes",
            tituloNovo: "Nova internacao",
            tituloVer: "Internacao",
            colunas: i => ({
                titulo: `${fmtData(i.entrada)} → ${i.saida ? fmtData(i.saida) : "internado"}`,
                meta: i.motivo || "—"
            }),
            form: i => `
                ${inputDate("entrada", i?.entrada, "Entrada")}
                ${inputDate("saida", i?.saida, "Saida (deixe vazio se ainda internado)")}
                ${inputArea("motivo", i?.motivo, "Motivo")}
                ${inputArea("evolucao", i?.evolucao, "Evolucao")}
            `,
            payload: (f, pacienteId) => ({
                pacienteId,
                entrada: f.entrada.value ? new Date(f.entrada.value).toISOString() : new Date().toISOString(),
                saida: f.saida.value ? new Date(f.saida.value).toISOString() : null,
                motivo: f.motivo.value,
                evolucao: f.evolucao.value
            }),
            detalhe: i => `
                ${Modais.linha("Entrada", fmtData(i.entrada))}
                ${Modais.linha("Saida", i.saida ? fmtData(i.saida) : "Ainda internado")}
                ${Modais.linha("Motivo", i.motivo)}
                ${Modais.linha("Evolucao", i.evolucao)}
            `
        },

        orcamentos: {
            recurso: "orcamentos",
            tituloLista: "Orcamentos",
            tituloNovo: "Novo orcamento",
            tituloVer: "Orcamento",
            colunas: o => ({
                titulo: `Orcamento de ${fmtData(o.data)}`,
                meta: `R$ ${(o.total || 0).toFixed(2).replace(".", ",")} · ${o.aprovado ? "Aprovado" : "Pendente"}`
            }),
            form: o => `
                ${inputDate("data", o?.data || new Date(), "Data")}
                <div class="bloco">
                    <h3>Itens</h3>
                    <div id="itens-orcamento">
                        ${((o?.itens) || [{}]).map((it, i) => itemOrcamentoHtml(it, i)).join("")}
                    </div>
                    <button type="button" class="btn btn-secundario" id="btn-add-item-orc">+ Adicionar item</button>
                </div>
                <div class="checkbox-grupo">
                    <label><input type="checkbox" name="aprovado" ${o?.aprovado ? "checked" : ""}/> Orcamento aprovado pelo tutor</label>
                </div>
            `,
            payload: (f, pacienteId) => {
                const itens = [];
                let total = 0;
                f.querySelectorAll(".item-orcamento").forEach(div => {
                    const desc = div.querySelector("[name=descricao]").value;
                    if (!desc) return;
                    const qtd = parseInt(div.querySelector("[name=quantidade]").value) || 1;
                    const v = parseFloat(div.querySelector("[name=valorUnitario]").value) || 0;
                    itens.push({ descricao: desc, quantidade: qtd, valorUnitario: v });
                    total += qtd * v;
                });
                return {
                    pacienteId,
                    data: f.data.value ? new Date(f.data.value).toISOString() : new Date().toISOString(),
                    itens,
                    total,
                    aprovado: f.aprovado.checked
                };
            },
            detalhe: o => `
                ${Modais.linha("Data", fmtData(o.data))}
                <div class="bloco">
                    <h3>Itens</h3>
                    <ul style="padding-left:18px">
                        ${(o.itens || []).map(i => `
                            <li>${i.descricao} — ${i.quantidade}x R$ ${(i.valorUnitario || 0).toFixed(2).replace(".", ",")}</li>
                        `).join("")}
                    </ul>
                </div>
                <div class="bloco">
                    <strong>Total:</strong> R$ ${(o.total || 0).toFixed(2).replace(".", ",")}<br>
                    <strong>Status:</strong> ${o.aprovado ? "Aprovado" : "Pendente"}
                </div>
            `,
            depoisDeAbrir: () => {
                document.getElementById("btn-add-item-orc")?.addEventListener("click", () => {
                    const cont = document.getElementById("itens-orcamento");
                    cont.insertAdjacentHTML("beforeend", itemOrcamentoHtml({}, cont.children.length));
                });
            }
        }
    };

    function itemPrescricaoHtml(it, i) {
        return `
            <div class="item-prescricao" style="border:1px solid var(--borda);border-radius:8px;padding:10px;margin-bottom:8px">
                <div class="grid-2">
                    <label>Medicamento<input type="text" name="medicamento" value="${it.medicamento || ""}" /></label>
                    <label>Dose<input type="text" name="dose" value="${it.dose || ""}" /></label>
                    <label>Via<input type="text" name="via" placeholder="oral, SC, IM..." value="${it.via || ""}" /></label>
                    <label>Frequencia<input type="text" name="frequencia" value="${it.frequencia || ""}" /></label>
                </div>
                <label style="margin-top:8px">Duracao<input type="text" name="duracao" value="${it.duracao || ""}" /></label>
            </div>
        `;
    }

    function itemOrcamentoHtml(it, i) {
        return `
            <div class="item-orcamento" style="border:1px solid var(--borda);border-radius:8px;padding:10px;margin-bottom:8px">
                <div class="grid-3">
                    <label>Descricao<input type="text" name="descricao" value="${it.descricao || ""}" /></label>
                    <label>Qtd<input type="number" name="quantidade" min="1" value="${it.quantidade || 1}" /></label>
                    <label>Valor unit.<input type="number" name="valorUnitario" step="0.01" min="0" value="${it.valorUnitario || ""}" /></label>
                </div>
            </div>
        `;
    }

    /* ============ Renderizacao da aba ============ */

    async function renderAba(aba, paciente) {
        const tipo = TIPOS[aba];
        if (!tipo) return `<p class="vazio">Aba nao implementada.</p>`;

        const lista = await API.listar(tipo.recurso, paciente.id).catch(() => []);
        const itens = lista.length === 0
            ? `<p class="vazio">Nenhum registro.</p>`
            : `<ul class="lista-itens">${lista.map(item => {
                const c = tipo.colunas(item);
                return `
                    <li class="clicavel" data-ver-extra="${aba}" data-id="${item.id}">
                        <div class="item-info">
                            <div class="item-titulo">${c.titulo}</div>
                            <div class="item-meta">${c.meta}</div>
                        </div>
                        <div class="item-acoes">
                            <button class="btn-mini btn-mini-delete" data-deletar="${aba}" data-id="${item.id}" title="Excluir">🗑</button>
                            <span class="seta">›</span>
                        </div>
                    </li>`;
            }).join("")}</ul>`;

        return `
            <div class="toolbar-aba">
                <h3>${tipo.tituloLista}</h3>
                <button class="btn btn-primary" data-novo="${aba}">+ ${tipo.tituloNovo}</button>
            </div>
            ${itens}
        `;
    }

    function ligarHandlers(paciente) {
        document.querySelectorAll("[data-novo]").forEach(btn => {
            btn.addEventListener("click", () => abrirNovo(btn.dataset.novo, paciente));
        });
        document.querySelectorAll("[data-ver-extra]").forEach(li => {
            li.addEventListener("click", e => {
                if (e.target.closest("[data-deletar]")) return;
                abrirVer(li.dataset.verExtra, li.dataset.id, paciente);
            });
        });
        document.querySelectorAll("[data-deletar]").forEach(btn => {
            btn.addEventListener("click", async e => {
                e.stopPropagation();
                if (!confirm("Excluir este registro? Esta acao nao pode ser desfeita.")) return;
                try {
                    await API.remover(TIPOS[btn.dataset.deletar].recurso, btn.dataset.id);
                    Abas.trocar(btn.dataset.deletar);
                } catch (ex) {
                    alert(ex.message);
                }
            });
        });
    }

    function abrirNovo(aba, paciente, existente = null) {
        const tipo = TIPOS[aba];
        Modais.abrir(`
            <h2>${existente ? "Editar" : tipo.tituloNovo}</h2>
            <form id="form-extra" class="form">
                ${tipo.form(existente)}
                <p id="msg-extra" class="msg-erro" hidden></p>
                <div class="modal-acoes">
                    <button type="button" class="btn btn-secundario" data-fechar-modal>Cancelar</button>
                    <button type="submit" class="btn btn-primary">Salvar</button>
                </div>
            </form>
        `);
        if (tipo.depoisDeAbrir) tipo.depoisDeAbrir();

        document.getElementById("form-extra").addEventListener("submit", async e => {
            e.preventDefault();
            const msg = document.getElementById("msg-extra");
            msg.hidden = true;
            try {
                const payload = tipo.payload(e.target, paciente.id);
                if (existente) {
                    await API.atualizar(tipo.recurso, existente.id, payload);
                } else {
                    await API.criar(tipo.recurso, payload);
                }
                Modais.fechar();
                Abas.trocar(aba);
            } catch (ex) {
                msg.textContent = ex.message;
                msg.hidden = false;
            }
        });
    }

    async function abrirVer(aba, id, paciente) {
        const tipo = TIPOS[aba];
        try {
            const item = await API.obter(tipo.recurso, id);
            Modais.abrir(`
                <h2>${tipo.tituloVer}</h2>
                <div class="bloco">${tipo.detalhe(item)}</div>
                <div class="modal-acoes">
                    <button class="btn btn-secundario" data-fechar-modal>Fechar</button>
                    <button class="btn btn-primary" id="btn-editar-extra">Editar</button>
                </div>
            `);
            document.getElementById("btn-editar-extra").addEventListener("click", () => {
                abrirNovo(aba, paciente, item);
            });
        } catch (ex) {
            alert(ex.message);
        }
    }

    return { renderAba, ligarHandlers, TIPOS };
})();
