// Modais reutilizaveis usados pelo botao "+" do header e pelas abas.
const Modais = (() => {

    function abrir(html) {
        const m = document.getElementById("modal");
        document.getElementById("modal-card").innerHTML = html;
        m.hidden = false;
        m.querySelectorAll("[data-fechar-modal]").forEach(el => {
            el.addEventListener("click", fechar);
        });
        return m.querySelector(".modal-card");
    }

    function fechar() {
        document.getElementById("modal").hidden = true;
    }

    /* =========== Novo Tutor + Paciente =========== */
    async function novoPaciente() {
        const tutores = await API.listarTutores().catch(() => []);
        abrir(`
            <h2>Novo paciente</h2>
            <form id="form-novo-paciente" class="form">
                <div class="grid-2">
                    <label>Nome do animal
                        <input type="text" name="nome" required />
                    </label>
                    <label>Data de nascimento
                        <input type="date" name="dataNascimento" />
                    </label>
                    <label>Espécie
                        <select name="especie" required>
                            <option value="Canino">Canino</option>
                            <option value="Felino">Felino</option>
                            <option value="Outro">Outro</option>
                        </select>
                    </label>
                    <label>Raça
                        <input type="text" name="raca" />
                    </label>
                    <label>Sexo
                        <select name="sexo" required>
                            <option value="Macho">Macho</option>
                            <option value="Femea">Fêmea</option>
                        </select>
                    </label>
                    <label>Peso (kg)
                        <input type="number" name="pesoKg" step="0.1" min="0" />
                    </label>
                </div>
                <div class="checkbox-grupo" style="margin-top:8px">
                    <label><input type="checkbox" name="castrado" /> Castrado</label>
                    <label><input type="checkbox" name="temAcessoRua" /> Tem acesso à rua</label>
                </div>

                <label>Tutor
                    <select name="tutorId">
                        <option value="">Selecione um tutor existente</option>
                        ${tutores.map(t => `<option value="${t.id}">${t.nome}</option>`).join("")}
                    </select>
                    <small style="color:var(--texto-suave);font-size:12px;font-weight:normal">
                        Ou cadastre um novo tutor logo abaixo.
                    </small>
                </label>

                <details>
                    <summary style="cursor:pointer;color:var(--roxo-escuro);font-weight:600">
                        Ou cadastrar novo tutor
                    </summary>
                    <div class="grid-2" style="margin-top:8px">
                        <label>Nome do tutor
                            <input type="text" name="tutorNome" />
                        </label>
                        <label>Telefone
                            <input type="text" name="tutorTelefone" />
                        </label>
                        <label>E-mail
                            <input type="email" name="tutorEmail" />
                        </label>
                        <label>CPF
                            <input type="text" name="tutorCpf" />
                        </label>
                    </div>
                </details>

                <p id="msg-novo-paciente" class="msg-erro" hidden></p>

                <div class="modal-acoes">
                    <button type="button" class="btn btn-secundario" data-fechar-modal>Cancelar</button>
                    <button type="submit" class="btn btn-primary">Cadastrar</button>
                </div>
            </form>
        `);

        document.getElementById("form-novo-paciente").addEventListener("submit", async e => {
            e.preventDefault();
            const f = e.target;
            const msg = document.getElementById("msg-novo-paciente");
            msg.hidden = true;
            try {
                let tutorId = f.tutorId.value;
                if (!tutorId && f.tutorNome.value.trim()) {
                    const novoTutor = await API.criarTutor({
                        nome: f.tutorNome.value,
                        telefone: f.tutorTelefone.value || null,
                        email: f.tutorEmail.value || null,
                        cpf: f.tutorCpf.value || null
                    });
                    tutorId = novoTutor.id;
                }
                if (!tutorId) throw new Error("Selecione ou cadastre um tutor.");

                await API.criarPaciente({
                    nome: f.nome.value,
                    dataNascimento: f.dataNascimento.value || null,
                    especie: f.especie.value,
                    raca: f.raca.value || null,
                    sexo: f.sexo.value,
                    castrado: f.castrado.checked,
                    pesoKg: f.pesoKg.value ? parseFloat(f.pesoKg.value) : null,
                    temAcessoRua: f.temAcessoRua.checked,
                    tutorId
                });
                fechar();
                App.carregarPacientes();
            } catch (ex) {
                msg.textContent = ex.message;
                msg.hidden = false;
            }
        });
    }

    /* =========== Nova Anamnese (replica a ficha do PDF) =========== */
    function novaAnamnese(paciente) {
        abrir(`
            <h2>Nova anamnese — ${paciente.nome}</h2>
            <form id="form-nova-anamnese" class="form">
                <div class="bloco">
                    <h3>Queixa principal</h3>
                    <textarea name="queixaPrincipal" rows="2" placeholder="Descrição..."></textarea>
                </div>

                <div class="bloco">
                    <h3>Histórico do quadro clínico atual</h3>
                    <label>Início dos sintomas
                        <input type="text" name="inicioSintomas" />
                    </label>
                    <label style="margin-top:8px">Possível desencadeador
                        <input type="text" name="possivelDesencadeador" />
                    </label>
                    <div class="checkbox-grupo" style="margin-top:10px">
                        <label><input type="checkbox" name="jaApresentou" /> Já apresentou antes</label>
                        <label><input type="checkbox" name="teveEvolucao" /> Teve evolução</label>
                        <label><input type="checkbox" name="usouMedicamento" /> Usou medicamento</label>
                        <label><input type="checkbox" name="contactanteMesmoQuadro" /> Contactante com mesmo quadro</label>
                    </div>
                    <label style="margin-top:8px">Evolução
                        <select name="evolucao">
                            <option value="">—</option>
                            <option value="melhora">Melhora</option>
                            <option value="piora">Piora</option>
                        </select>
                    </label>
                    <label style="margin-top:8px">Qual medicamento
                        <input type="text" name="qualMedicamento" />
                    </label>
                    <label style="margin-top:8px">Informação adicional
                        <textarea name="informacaoAdicional" rows="2"></textarea>
                    </label>
                </div>

                <div class="bloco">
                    <h3>Inspeção geral</h3>
                    <div class="grid-3">
                        <label>Temperatura<input type="text" name="temperatura" /></label>
                        <label>FC<input type="text" name="fc" /></label>
                        <label>FR<input type="text" name="fr" /></label>
                        <label>TPC<input type="text" name="tpc" /></label>
                        <label>TC<input type="text" name="tc" /></label>
                        <label>Peso/Escore<input type="text" name="escoreCorporalPeso" /></label>
                    </div>
                </div>

                <div class="bloco">
                    <h3>Diagnóstico e conduta</h3>
                    <label>Diagnóstico<textarea name="diagnostico" rows="2"></textarea></label>
                    <label style="margin-top:8px">Conduta clínica<textarea name="condutaClinica" rows="2"></textarea></label>
                    <label style="margin-top:8px">Procedimentos realizados<textarea name="procedimentosRealizados" rows="2"></textarea></label>
                </div>

                <p id="msg-anamnese" class="msg-erro" hidden></p>
                <div class="modal-acoes">
                    <button type="button" class="btn btn-secundario" data-fechar-modal>Cancelar</button>
                    <button type="submit" class="btn btn-primary">Salvar</button>
                </div>
            </form>
        `);

        document.getElementById("form-nova-anamnese").addEventListener("submit", async e => {
            e.preventDefault();
            const f = e.target;
            const msg = document.getElementById("msg-anamnese");
            msg.hidden = true;
            try {
                const payload = {
                    pacienteId: paciente.id,
                    queixaPrincipal: f.queixaPrincipal.value,
                    inicioSintomas: f.inicioSintomas.value,
                    possivelDesencadeador: f.possivelDesencadeador.value,
                    jaApresentou: f.jaApresentou.checked,
                    teveEvolucao: f.teveEvolucao.checked,
                    evolucao: f.evolucao.value || null,
                    usouMedicamento: f.usouMedicamento.checked,
                    qualMedicamento: f.qualMedicamento.value,
                    contactanteMesmoQuadro: f.contactanteMesmoQuadro.checked,
                    informacaoAdicional: f.informacaoAdicional.value,
                    diagnostico: f.diagnostico.value,
                    condutaClinica: f.condutaClinica.value,
                    procedimentosRealizados: f.procedimentosRealizados.value,
                    inspecaoGeral: {
                        temperatura: f.temperatura.value,
                        fc: f.fc.value,
                        fr: f.fr.value,
                        tpc: f.tpc.value,
                        tc: f.tc.value,
                        escoreCorporalPeso: f.escoreCorporalPeso.value
                    }
                };
                await API.criarAnamnese(payload);
                fechar();
                Abas.trocar("anamnese");
            } catch (ex) {
                msg.textContent = ex.message;
                msg.hidden = false;
            }
        });
    }

    /* =========== Nova Solicitacao de Exames =========== */
    async function novaSolicitacao(paciente) {
        const catalogo = await API.catalogoExames();
        const grupos = {};
        catalogo.forEach(e => {
            grupos[e.categoria] = grupos[e.categoria] || [];
            grupos[e.categoria].push(e);
        });

        abrir(`
            <h2>Nova solicitação de exames — ${paciente.nome}</h2>
            <form id="form-solicitacao" class="form">
                <label>Data
                    <input type="date" name="data" value="${new Date().toISOString().slice(0,10)}" />
                </label>
                <label>Buscar exame
                    <input type="text" id="busca-exame" placeholder="Hematologia, ureia, raio-x..." autocomplete="off" />
                </label>
                <div id="catalogo-exames" style="max-height:240px;overflow-y:auto;border:1px solid var(--borda);border-radius:8px;padding:8px"></div>

                <div class="bloco">
                    <h3>Exames selecionados</h3>
                    <ul id="exames-selecionados" class="lista-itens"></ul>
                </div>

                <label>Motivos da solicitação (suspeitas clínicas)
                    <textarea name="motivos" rows="3"></textarea>
                </label>

                <p id="msg-exame" class="msg-erro" hidden></p>
                <div class="modal-acoes">
                    <button type="button" class="btn btn-secundario" data-fechar-modal>Cancelar</button>
                    <button type="submit" class="btn btn-primary">Solicitar</button>
                </div>
            </form>
        `);

        const selecionados = [];
        const cat = document.getElementById("catalogo-exames");

        function renderCat(filtro = "") {
            const f = filtro.toLowerCase();
            cat.innerHTML = Object.entries(grupos).map(([categoria, itens]) => {
                const filtrados = itens.filter(i =>
                    i.nome.toLowerCase().includes(f) || categoria.toLowerCase().includes(f));
                if (filtrados.length === 0) return "";
                return `
                    <div style="margin-bottom:8px">
                        <strong style="color:var(--roxo-escuro);font-size:13px">${categoria}</strong>
                        ${filtrados.map(i => `
                            <div style="padding:4px 0;font-size:13px;cursor:pointer" data-categoria="${categoria}" data-nome="${i.nome}">
                                + ${i.nome}
                            </div>
                        `).join("")}
                    </div>
                `;
            }).join("");

            cat.querySelectorAll("[data-nome]").forEach(el => {
                el.addEventListener("click", () => {
                    selecionados.push({
                        categoria: el.dataset.categoria,
                        nome: el.dataset.nome,
                        parametros: []
                    });
                    renderSelecionados();
                });
            });
        }

        function renderSelecionados() {
            const ul = document.getElementById("exames-selecionados");
            if (selecionados.length === 0) {
                ul.innerHTML = `<li class="vazio" style="padding:10px">Nenhum exame selecionado.</li>`;
                return;
            }
            ul.innerHTML = selecionados.map((e, i) => `
                <li>
                    <div class="item-info">
                        <div class="item-titulo">${e.categoria} — ${e.nome}</div>
                    </div>
                    <div class="item-acoes">
                        <button type="button" class="btn btn-secundario" data-remover="${i}">Remover</button>
                    </div>
                </li>
            `).join("");
            ul.querySelectorAll("[data-remover]").forEach(b => {
                b.addEventListener("click", () => {
                    selecionados.splice(parseInt(b.dataset.remover), 1);
                    renderSelecionados();
                });
            });
        }

        renderCat();
        renderSelecionados();
        document.getElementById("busca-exame").addEventListener("input", e => renderCat(e.target.value));

        document.getElementById("form-solicitacao").addEventListener("submit", async e => {
            e.preventDefault();
            const f = e.target;
            const msg = document.getElementById("msg-exame");
            msg.hidden = true;
            try {
                if (selecionados.length === 0) throw new Error("Selecione ao menos um exame.");
                await API.criarExame({
                    pacienteId: paciente.id,
                    data: new Date(f.data.value).toISOString(),
                    exames: selecionados,
                    motivos: f.motivos.value
                });
                fechar();
                Abas.trocar("exames");
            } catch (ex) {
                msg.textContent = ex.message;
                msg.hidden = false;
            }
        });
    }

    /* =========== Novo Atestado =========== */
    async function novoAtestado(paciente) {
        const modelos = await API.modelosAtestado();
        abrir(`
            <h2>Novo atestado ou termo — ${paciente.nome}</h2>
            <form id="form-atestado" class="form">
                <div class="grid-2">
                    <label>Cidade
                        <input type="text" name="cidade" placeholder="ex: Belo Horizonte" />
                    </label>
                    <label>Data de emissão
                        <input type="date" name="dataEmissao" value="${new Date().toISOString().slice(0,10)}" />
                    </label>
                </div>

                <label>Modelo
                    <select name="tipo" id="select-modelo">
                        ${modelos.map(m => `
                            <option value="${m.tipo}" data-conteudo="${m.conteudo.replace(/"/g,'&quot;')}">
                                ${m.titulo}${m.padrao ? " (Padrão)" : ""}
                            </option>
                        `).join("")}
                    </select>
                </label>

                <label>Conteudo do documento
                    <textarea name="conteudo" rows="6">${modelos[0]?.conteudo || ""}</textarea>
                </label>

                <label>Identificação complementar
                    <textarea name="identificacaoComplementar" rows="2"></textarea>
                </label>

                <p id="msg-atestado" class="msg-erro" hidden></p>
                <div class="modal-acoes">
                    <button type="button" class="btn btn-secundario" data-fechar-modal>Cancelar</button>
                    <button type="submit" class="btn btn-primary">Emitir</button>
                </div>
            </form>
        `);

        const sel = document.getElementById("select-modelo");
        const txt = document.querySelector("textarea[name=conteudo]");
        sel.addEventListener("change", () => {
            const opt = sel.options[sel.selectedIndex];
            txt.value = opt.dataset.conteudo;
        });

        document.getElementById("form-atestado").addEventListener("submit", async e => {
            e.preventDefault();
            const f = e.target;
            const msg = document.getElementById("msg-atestado");
            msg.hidden = true;
            try {
                await API.criarAtestado({
                    pacienteId: paciente.id,
                    tipo: f.tipo.value,
                    cidade: f.cidade.value,
                    dataEmissao: new Date(f.dataEmissao.value).toISOString(),
                    conteudo: f.conteudo.value,
                    identificacaoComplementar: f.identificacaoComplementar.value
                });
                fechar();
                Abas.trocar("atestados");
            } catch (ex) {
                msg.textContent = ex.message;
                msg.hidden = false;
            }
        });
    }

    /* =========== Visualizacao de detalhe =========== */
    function linha(rotulo, valor) {
        if (valor === null || valor === undefined || valor === "" || valor === false) return "";
        const v = valor === true ? "Sim" : valor;
        return `<div style="margin-bottom:6px"><strong>${rotulo}:</strong> ${v}</div>`;
    }

    function listaCheck(rotulo, arr) {
        if (!arr || arr.length === 0) return "";
        return `<div style="margin-bottom:6px"><strong>${rotulo}:</strong> ${arr.join(", ")}</div>`;
    }

    function formatarData(iso) {
        if (!iso) return "—";
        return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
    }

    async function verAnamnese(id) {
        const a = await API.obterAnamnese(id);
        const ig = a.inspecaoGeral || {};
        const hc = a.historicoClinico || {};
        abrir(`
            <h2>Anamnese de ${formatarData(a.criadoEm)}</h2>

            <div class="bloco">
                <h3>Queixa principal</h3>
                <p>${a.queixaPrincipal || "<em>não informado</em>"}</p>
            </div>

            <div class="bloco">
                <h3>Histórico do quadro clínico atual</h3>
                ${linha("Início dos sintomas", a.inicioSintomas)}
                ${linha("Possível desencadeador", a.possivelDesencadeador)}
                ${linha("Já apresentou antes", a.jaApresentou)}
                ${linha("Teve evolução", a.teveEvolucao)}
                ${linha("Evolução", a.evolucao)}
                ${linha("Usou medicamento", a.usouMedicamento)}
                ${linha("Qual medicamento", a.qualMedicamento)}
                ${linha("Contactante com mesmo quadro", a.contactanteMesmoQuadro)}
                ${linha("Informação adicional", a.informacaoAdicional)}
            </div>

            <div class="bloco">
                <h3>Histórico clínico geral</h3>
                ${listaCheck("Vacinação", hc.vacinacao)}
                ${linha("Vermifugação", hc.vermifugacao)}
                ${linha("Controle ectoparasitário", hc.controleEctoparasitario)}
                ${linha("Doença pré-existente", hc.doencaPreExistente)}
                ${linha("Alimentação", hc.alimentacao)}
                ${linha("Ingestão hídrica", hc.ingestaoHidrica)}
                ${linha("Último cio", hc.ultimoCio)}
                ${linha("Contactantes", hc.contactantes)}
                ${linha("Teste FIV/FELV/Leishmaniose", hc.testeFivFelvLeishmaniose)}
            </div>

            <div class="bloco">
                <h3>Inspeção geral</h3>
                ${linha("Temperatura", ig.temperatura)}
                ${linha("Escore corporal / peso", ig.escoreCorporalPeso)}
                ${linha("Atividade", ig.atividade)}
                ${linha("FC", ig.fc)} ${linha("FR", ig.fr)} ${linha("TPC", ig.tpc)} ${linha("TC", ig.tc)}
                ${linha("Ausculta", ig.ausculta)}
                ${linha("Mucosas", ig.mucosas)}
                ${linha("Comportamento", ig.comportamento)}
                ${listaCheck("Gastrointestinal", ig.gastrointestinal)}
                ${listaCheck("Urogenital", ig.urogenital)}
                ${listaCheck("Neurológico", ig.neurologico)}
                ${listaCheck("Olhos", ig.olhos)}
                ${listaCheck("Ouvidos", ig.ouvidos)}
                ${listaCheck("Locomotor", ig.locomotor)}
                ${listaCheck("Nariz", ig.nariz)}
                ${listaCheck("Pele", ig.pele)}
                ${listaCheck("Cavidade oral", ig.cavidadeOral)}
            </div>

            <div class="bloco">
                <h3>Diagnóstico e conduta</h3>
                ${linha("Local da lesão", a.localLesao)}
                ${linha("Diagnóstico", a.diagnostico)}
                ${linha("Conduta clínica", a.condutaClinica)}
                ${linha("Procedimentos realizados", a.procedimentosRealizados)}
                ${linha("Exames solicitados", a.examesSolicitadosTexto)}
                ${linha("Extras", a.extras)}
            </div>

            <div class="modal-acoes">
                <button class="btn btn-secundario" data-fechar-modal>Fechar</button>
            </div>
        `);
    }

    async function verExame(id) {
        const s = await API.obterExame(id);
        const grupos = {};
        (s.exames || []).forEach(e => {
            grupos[e.categoria] = grupos[e.categoria] || [];
            grupos[e.categoria].push(e);
        });
        abrir(`
            <h2>Solicitação de exames — ${formatarData(s.data)}</h2>
            ${Object.entries(grupos).map(([cat, itens]) => `
                <div class="bloco">
                    <h3>${cat}</h3>
                    <ul style="padding-left:18px">
                        ${itens.map(i => `
                            <li>
                                ${i.nome}
                                ${i.parametros && i.parametros.length > 0
                                    ? `<div style="font-size:12px;color:var(--texto-suave);margin-left:6px">${i.parametros.join(", ")}</div>`
                                    : ""}
                            </li>
                        `).join("")}
                    </ul>
                </div>
            `).join("")}
            <div class="bloco">
                <h3>Motivos da solicitação</h3>
                <p>${s.motivos || "<em>não informado</em>"}</p>
            </div>
            <div class="modal-acoes">
                <button class="btn btn-secundario" data-fechar-modal>Fechar</button>
            </div>
        `);
    }

    async function verAtestado(id) {
        const a = await API.obterAtestado(id);
        const paciente = await API.obterPaciente(a.pacienteId).catch(() => null);
        const titulosTipo = {
            TermoExames: "Termo para Realização de Exames",
            TermoProcedimentoRisco: "Termo para Procedimento Terapêutico de Risco",
            TermoObito: "Termo de Óbito",
            TermoEutanasia: "Termo para Realização de Eutanásia",
            TermoCirurgico: "Termo para Procedimentos Cirúrgicos",
            TermoRetiradaSemAlta: "Termo para Retirada sem Alta",
            AtestadoEncaminhamento: "Atestado de Encaminhamento"
        };
        abrir(`
            <h2>${titulosTipo[a.tipo] || a.tipo}</h2>
            <div class="bloco">
                ${linha("Cidade", a.cidade)}
                ${linha("Data de emissão", formatarData(a.dataEmissao))}
            </div>
            <div class="bloco">
                <h3>Conteúdo</h3>
                <p style="white-space:pre-wrap">${a.conteudo || ""}</p>
            </div>
            ${a.identificacaoComplementar ? `
                <div class="bloco">
                    <h3>Identificação complementar</h3>
                    <p style="white-space:pre-wrap">${a.identificacaoComplementar}</p>
                </div>
            ` : ""}
            <div class="modal-acoes">
                <button class="btn btn-secundario" data-fechar-modal>Fechar</button>
                <button class="btn btn-secundario" id="btn-imprimir-atestado">Imprimir</button>
                <button class="btn btn-primary" id="btn-pdf-atestado">📄 Baixar PDF</button>
            </div>
        `);

        document.getElementById("btn-imprimir-atestado").addEventListener("click", () => window.print());
        document.getElementById("btn-pdf-atestado").addEventListener("click", () => {
            if (!paciente) {
                alert("Não foi possível carregar os dados do paciente para gerar o PDF.");
                return;
            }
            PDFAtestado.gerar(a, paciente);
        });
    }

    return {
        abrir, fechar,
        novoPaciente, novaAnamnese, novaSolicitacao, novoAtestado,
        verAnamnese, verExame, verAtestado,
        linha, listaCheck
    };
})();
