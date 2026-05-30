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

    /* =========== Nova Anamnese (modelo Camila Rosa) =========== */

    // Estrutura usada para gerar o form e o detalhe.
    const PARAMETROS_CLINICOS = [
        { key: "hidratacao",            label: "Hidratação" },
        { key: "temperatura",           label: "Temperatura" },
        { key: "glicemia",              label: "Glicemia" },
        { key: "pressaoArterial",       label: "Pressão arterial sistêmica" },
        { key: "mucosa",                label: "Mucosa" },
        { key: "linfonodos",            label: "Linfonodos" },
        { key: "pelagem",               label: "Pelagem" },
        { key: "deambulacao",           label: "Deambulação" },
        { key: "frequenciaCardiaca",    label: "Frequência cardíaca" },
        { key: "propriocepcao",         label: "Propriocepção" },
        { key: "frequenciaRespiratoria", label: "Frequência respiratória" },
        { key: "palpacaoAbdominal",     label: "Palpação Abdominal" },
        { key: "cavidadeOral",          label: "Cavidade oral" },
        { key: "cavidadeNasal",         label: "Cavidade nasal" },
        { key: "condutosAuditivos",     label: "Condutos auditivos" },
        { key: "oftalmologicos",        label: "Oftalmológicos" }
    ];

    const HISTORICO_SIMPLES_SIM_NAO_COMDATA = [
        { key: "vacinacao",              label: "Vacinação" },
        { key: "controleEndoparasitoses", label: "Controle endoparasitoses" },
        { key: "controleEctoparasitoses", label: "Controle ectoparasitoses" }
    ];

    const HISTORICO_SIM_NAO_COMDESC = [
        { key: "usoMedicacao",        label: "Uso cont. de medicação" },
        { key: "usoSuplementacao",    label: "Uso de suplementação" },
        { key: "realizouCirurgias",   label: "Realizou cirurgias" },
        { key: "possuiExameRecente",  label: "Possui exame recente" },
        { key: "testadoFivFelv",      label: "Felino | Testado FIV/FeLV" },
        { key: "alergiaMedicamentos", label: "Alergia a medicamentos" }
    ];

    /** Radio com bolinha estilo PDF. Para escolha unica. */
    function radioGrupo(name, opcoes) {
        return opcoes.map(o => `
            <label class="opcao-circulo">
                <input type="radio" name="${name}" value="${o.value}" />
                <span class="circulo"></span>${o.label}
            </label>
        `).join("");
    }

    /** Checkbox com bolinha estilo PDF (multi-select). */
    function checkboxGrupo(name, opcoes) {
        return opcoes.map(o => `
            <label class="opcao-circulo">
                <input type="checkbox" name="${name}" value="${o}" />
                <span class="circulo"></span>${o}
            </label>
        `).join("");
    }

    function linhaSistema(label, name, opcoes) {
        return `
            <div class="ficha-linha">
                <div class="ficha-rotulo">${label}:</div>
                <div class="ficha-opcoes">
                    ${checkboxGrupo(name, opcoes)}
                    <label class="opcao-outros">
                        <span class="circulo"></span>Outros
                        <input type="text" name="${name}Outros" />
                    </label>
                </div>
            </div>
        `;
    }

    function linhaSimNaoComData(item) {
        return `
            <div class="ficha-linha">
                <div class="ficha-rotulo">${item.label}:</div>
                <div class="ficha-opcoes">
                    ${radioGrupo(item.key, [
                        { value: "true", label: "Sim" },
                        { value: "false", label: "Não" }
                    ])}
                    <label class="opcao-outros">Data:
                        <input type="text" name="${item.key}Data" placeholder="dd/mm/aaaa" />
                    </label>
                    <label class="opcao-outros">Quais:
                        <input type="text" name="${item.key}Quais" />
                    </label>
                </div>
            </div>
        `;
    }

    function linhaSimNaoComDesc(item) {
        return `
            <div class="ficha-linha">
                <div class="ficha-rotulo">${item.label}:</div>
                <div class="ficha-opcoes">
                    <label class="opcao-circulo">
                        <input type="radio" name="${item.key}" value="true" />
                        <span class="circulo"></span>Sim
                        <input type="text" name="${item.key}Descricao" class="ficha-input-inline" />
                    </label>
                    <label class="opcao-circulo">
                        <input type="radio" name="${item.key}" value="false" />
                        <span class="circulo"></span>Não
                    </label>
                </div>
            </div>
        `;
    }

    function linhaParametro(p) {
        return `
            <div class="ficha-linha ficha-linha-compacta">
                <div class="ficha-rotulo">${p.label}:</div>
                <div class="ficha-opcoes">
                    <label class="opcao-circulo">
                        <input type="radio" name="${p.key}Status" value="Normal" />
                        <span class="circulo"></span>Normal
                    </label>
                    <label class="opcao-circulo">
                        <input type="radio" name="${p.key}Status" value="Alterada" />
                        <span class="circulo"></span>Alterada
                        <input type="text" name="${p.key}Descricao" class="ficha-input-inline" />
                    </label>
                </div>
            </div>
        `;
    }

    function novaAnamnese(paciente) {
        abrir(`
            <h2>Anamnese Veterinária — ${paciente.nome}</h2>
            <form id="form-nova-anamnese" class="form ficha-form">

                <div class="bloco-ficha">
                    <h3>IDENTIFICAÇÃO DO RESPONSÁVEL</h3>
                    <div class="grid-2">
                        <label>Responsável<input type="text" name="responsavel" value="${paciente.tutorNome || ""}" /></label>
                        <label>CPF<input type="text" name="cpfResponsavel" /></label>
                        <label>Endereço<input type="text" name="enderecoResponsavel" /></label>
                        <label>Telefone<input type="text" name="telefoneResponsavel" /></label>
                    </div>
                </div>

                <div class="bloco-ficha">
                    <h3>QUEIXA PRINCIPAL</h3>
                    <textarea name="queixaPrincipal" rows="3"></textarea>
                </div>

                <div class="bloco-ficha">
                    <h3>ANAMNESE</h3>
                    <textarea name="anamneseTexto" rows="5" placeholder="Histórico do quadro, evolução, fatores..."></textarea>

                    <div class="ficha-linha" style="margin-top:10px">
                        <div class="ficha-rotulo">Doenças pregressas:</div>
                        <div class="ficha-opcoes">
                            <label class="opcao-circulo">
                                <input type="radio" name="doencasPregressas" value="true" />
                                <span class="circulo"></span>Sim
                                <input type="text" name="doencasPregressasDescricao" class="ficha-input-inline" />
                            </label>
                            <label class="opcao-circulo">
                                <input type="radio" name="doencasPregressas" value="false" />
                                <span class="circulo"></span>Não
                            </label>
                        </div>
                    </div>

                    <div class="ficha-linha">
                        <div class="ficha-rotulo">Doenças presentes:</div>
                        <div class="ficha-opcoes">
                            <label class="opcao-circulo">
                                <input type="radio" name="doencasPresentes" value="true" />
                                <span class="circulo"></span>Sim
                                <input type="text" name="doencasPresentesDescricao" class="ficha-input-inline" />
                            </label>
                            <label class="opcao-circulo">
                                <input type="radio" name="doencasPresentes" value="false" />
                                <span class="circulo"></span>Não
                            </label>
                        </div>
                    </div>
                </div>

                <div class="bloco-ficha">
                    <h3>EXAME FÍSICO</h3>

                    ${linhaSistema("Sistema digestório", "sistemaDigestorio",
                        ["Vômito", "Regurgitação", "Diarréia"])}

                    <div class="ficha-linha">
                        <div class="ficha-rotulo">Alimentação:</div>
                        <div class="ficha-opcoes">
                            ${radioGrupo("alimentacao", [
                                { value: "Normorexia",  label: "Normorexia" },
                                { value: "Hiporexia",   label: "Hiporexia" },
                                { value: "Hiperorexia", label: "Hiperorexia" },
                                { value: "Anorexia",    label: "Anorexia" }
                            ])}
                            <label class="opcao-outros">
                                <span class="circulo"></span>Outros
                                <input type="text" name="alimentacaoOutros" />
                            </label>
                        </div>
                    </div>

                    <div class="ficha-linha">
                        <div class="ficha-rotulo">Ingestão de Água:</div>
                        <div class="ficha-opcoes">
                            ${radioGrupo("ingestaoAgua", [
                                { value: "Normodipsia", label: "Normodipsia" },
                                { value: "Oligodipsia", label: "Oligodipsia/Hipodpsia" },
                                { value: "Polidipsia",  label: "Polidipsia" },
                                { value: "Adipsia",     label: "Adipsia" }
                            ])}
                            <label class="opcao-outros">
                                <span class="circulo"></span>Outros
                                <input type="text" name="ingestaoAguaOutros" />
                            </label>
                        </div>
                    </div>

                    ${linhaSistema("Sistema urogenital", "sistemaUrogenital",
                        ["Urina normal", "Dificuldade micção", "Secreção vaginal", "Castrado",
                         "Anúria", "Disúria", "Poliúria", "Oligúria"])}

                    ${linhaSistema("Sistema cardiorrespiratório", "sistemaCardiorrespiratorio",
                        ["Tosse", "Cansaço respiratório", "Secreção nasal"])}

                    ${linhaSistema("Sistema neurológico", "sistemaNeurologico",
                        ["Convulsão", "Inclinação cabeça", "Ataxia"])}

                    ${linhaSistema("Sistema locomotor", "sistemaLocomotor",
                        ["Dificuldade locomoção", "Alterações posturais", "Fraturas"])}

                    ${linhaSistema("Pele", "pele",
                        ["Prurido", "Ectoparasitas", "Queda de pelo", "Alopecia"])}

                    ${linhaSistema("Olhos", "olhos",
                        ["Secreção ocular", "Déficit visual", "Prurido"])}

                    ${linhaSistema("Ouvido", "ouvido",
                        ["Prurido", "Secreção"])}

                    ${linhaSistema("Ambiente", "ambiente",
                        ["Rural", "Urbano", "Acesso à rua"])}
                </div>

                <div class="bloco-ficha">
                    <h3>HISTÓRICO CLÍNICO</h3>
                    ${HISTORICO_SIMPLES_SIM_NAO_COMDATA.map(linhaSimNaoComData).join("")}
                    ${HISTORICO_SIM_NAO_COMDESC.map(linhaSimNaoComDesc).join("")}
                </div>

                <div class="bloco-ficha">
                    <h3>PARÂMETROS CLÍNICOS</h3>
                    <div class="grid-2">
                        ${PARAMETROS_CLINICOS.map(linhaParametro).join("")}
                    </div>
                </div>

                <div class="bloco-ficha">
                    <h3>CONDUTA CLÍNICA</h3>
                    <textarea name="condutaClinica" rows="4"></textarea>
                </div>

                <div class="bloco-ficha">
                    <h3>TRATAMENTOS E EXAMES SOLICITADOS</h3>
                    <textarea name="tratamentosExamesSolicitados" rows="3"></textarea>
                </div>

                <div class="bloco-ficha">
                    <h3>RETORNO</h3>
                    <textarea name="retorno" rows="2"></textarea>
                </div>

                <p id="msg-anamnese" class="msg-erro" hidden></p>
                <div class="modal-acoes">
                    <button type="button" class="btn btn-secundario" data-fechar-modal>Cancelar</button>
                    <button type="submit" class="btn btn-primary">Salvar anamnese</button>
                </div>
            </form>
        `);

        document.getElementById("form-nova-anamnese").addEventListener("submit", async e => {
            e.preventDefault();
            const f = e.target;
            const msg = document.getElementById("msg-anamnese");
            msg.hidden = true;
            try {
                const valoresMarcados = (name) =>
                    Array.from(f.querySelectorAll(`[name=${name}]:checked`)).map(c => c.value);

                const radioBool = (name) => {
                    const v = (f.querySelector(`[name=${name}]:checked`) || {}).value;
                    return v === "true" ? true : v === "false" ? false : null;
                };
                const radioStr = (name) =>
                    (f.querySelector(`[name=${name}]:checked`) || {}).value || null;

                // Parametros clinicos -> Dictionary
                const parametros = {};
                PARAMETROS_CLINICOS.forEach(p => {
                    const status = radioStr(`${p.key}Status`);
                    const desc = f[`${p.key}Descricao`]?.value;
                    if (status || desc) {
                        parametros[p.key] = { status, descricao: desc };
                    }
                });

                // Historico clinico
                const historicoClinico = {};
                HISTORICO_SIMPLES_SIM_NAO_COMDATA.forEach(it => {
                    historicoClinico[it.key] = radioBool(it.key);
                    historicoClinico[`${it.key}Data`] = f[`${it.key}Data`]?.value || null;
                    historicoClinico[`${it.key}Quais`] = f[`${it.key}Quais`]?.value || null;
                });
                HISTORICO_SIM_NAO_COMDESC.forEach(it => {
                    historicoClinico[it.key] = radioBool(it.key);
                    historicoClinico[`${it.key}Descricao`] = f[`${it.key}Descricao`]?.value || null;
                });

                const payload = {
                    pacienteId: paciente.id,
                    responsavel: f.responsavel.value || null,
                    cpfResponsavel: f.cpfResponsavel.value || null,
                    enderecoResponsavel: f.enderecoResponsavel.value || null,
                    telefoneResponsavel: f.telefoneResponsavel.value || null,
                    queixaPrincipal: f.queixaPrincipal.value || null,
                    anamneseTexto: f.anamneseTexto.value || null,
                    doencasPregressas: radioBool("doencasPregressas"),
                    doencasPregressasDescricao: f.doencasPregressasDescricao.value || null,
                    doencasPresentes: radioBool("doencasPresentes"),
                    doencasPresentesDescricao: f.doencasPresentesDescricao.value || null,
                    sistemaDigestorio: valoresMarcados("sistemaDigestorio"),
                    sistemaDigestorioOutros: f.sistemaDigestorioOutros.value || null,
                    alimentacao: radioStr("alimentacao"),
                    alimentacaoOutros: f.alimentacaoOutros.value || null,
                    ingestaoAgua: radioStr("ingestaoAgua"),
                    ingestaoAguaOutros: f.ingestaoAguaOutros.value || null,
                    sistemaUrogenital: valoresMarcados("sistemaUrogenital"),
                    sistemaUrogenitalOutros: f.sistemaUrogenitalOutros.value || null,
                    sistemaCardiorrespiratorio: valoresMarcados("sistemaCardiorrespiratorio"),
                    sistemaCardiorrespiratorioOutros: f.sistemaCardiorrespiratorioOutros.value || null,
                    sistemaNeurologico: valoresMarcados("sistemaNeurologico"),
                    sistemaNeurologicoOutros: f.sistemaNeurologicoOutros.value || null,
                    sistemaLocomotor: valoresMarcados("sistemaLocomotor"),
                    sistemaLocomotorOutros: f.sistemaLocomotorOutros.value || null,
                    pele: valoresMarcados("pele"),
                    peleOutros: f.peleOutros.value || null,
                    olhos: valoresMarcados("olhos"),
                    olhosOutros: f.olhosOutros.value || null,
                    ouvido: valoresMarcados("ouvido"),
                    ouvidoOutros: f.ouvidoOutros.value || null,
                    ambiente: valoresMarcados("ambiente"),
                    ambienteOutros: f.ambienteOutros.value || null,
                    historicoClinico,
                    parametrosClinicos: parametros,
                    condutaClinica: f.condutaClinica.value || null,
                    tratamentosExamesSolicitados: f.tratamentosExamesSolicitados.value || null,
                    retorno: f.retorno.value || null
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
        const hc = a.historicoClinico || {};
        const pc = a.parametrosClinicos || {};

        const sec = (titulo, conteudo) =>
            conteudo && conteudo.trim()
                ? `<div class="bloco"><h3>${titulo}</h3>${conteudo}</div>`
                : "";

        const sistema = (titulo, arr, outros) => {
            const partes = (arr && arr.length) ? arr.join(", ") : "";
            const combinado = [partes, outros].filter(Boolean).join(" · ");
            return combinado ? linha(titulo, combinado) : "";
        };

        const labelsParametros = {
            hidratacao: "Hidratação", temperatura: "Temperatura", glicemia: "Glicemia",
            pressaoArterial: "Pressão arterial sistêmica", mucosa: "Mucosa", linfonodos: "Linfonodos",
            pelagem: "Pelagem", deambulacao: "Deambulação", frequenciaCardiaca: "Frequência cardíaca",
            propriocepcao: "Propriocepção", frequenciaRespiratoria: "Frequência respiratória",
            palpacaoAbdominal: "Palpação Abdominal", cavidadeOral: "Cavidade oral",
            cavidadeNasal: "Cavidade nasal", condutosAuditivos: "Condutos auditivos",
            oftalmologicos: "Oftalmológicos"
        };

        const parametrosHtml = Object.entries(pc).map(([k, v]) =>
            linha(labelsParametros[k] || k,
                  `${v.status || "—"}${v.descricao ? ` (${v.descricao})` : ""}`)
        ).join("");

        abrir(`
            <h2>Anamnese Veterinária — ${formatarData(a.criadoEm)}</h2>

            ${sec("Identificação do responsável", `
                ${linha("Responsável", a.responsavel)}
                ${linha("CPF", a.cpfResponsavel)}
                ${linha("Endereço", a.enderecoResponsavel)}
                ${linha("Telefone", a.telefoneResponsavel)}
            `)}

            ${sec("Queixa principal",
                `<p style="white-space:pre-wrap">${a.queixaPrincipal || "<em>não informado</em>"}</p>`)}

            ${sec("Anamnese", `
                ${a.anamneseTexto ? `<p style="white-space:pre-wrap;margin-bottom:8px">${a.anamneseTexto}</p>` : ""}
                ${linha("Doenças pregressas", a.doencasPregressas === true ? `Sim — ${a.doencasPregressasDescricao || "—"}` : a.doencasPregressas === false ? "Não" : null)}
                ${linha("Doenças presentes", a.doencasPresentes === true ? `Sim — ${a.doencasPresentesDescricao || "—"}` : a.doencasPresentes === false ? "Não" : null)}
            `)}

            ${sec("Exame físico", `
                ${sistema("Sistema digestório", a.sistemaDigestorio, a.sistemaDigestorioOutros)}
                ${linha("Alimentação", [a.alimentacao, a.alimentacaoOutros].filter(Boolean).join(" · "))}
                ${linha("Ingestão de água", [a.ingestaoAgua, a.ingestaoAguaOutros].filter(Boolean).join(" · "))}
                ${sistema("Sistema urogenital", a.sistemaUrogenital, a.sistemaUrogenitalOutros)}
                ${sistema("Sistema cardiorrespiratório", a.sistemaCardiorrespiratorio, a.sistemaCardiorrespiratorioOutros)}
                ${sistema("Sistema neurológico", a.sistemaNeurologico, a.sistemaNeurologicoOutros)}
                ${sistema("Sistema locomotor", a.sistemaLocomotor, a.sistemaLocomotorOutros)}
                ${sistema("Pele", a.pele, a.peleOutros)}
                ${sistema("Olhos", a.olhos, a.olhosOutros)}
                ${sistema("Ouvido", a.ouvido, a.ouvidoOutros)}
                ${sistema("Ambiente", a.ambiente, a.ambienteOutros)}
            `)}

            ${sec("Histórico clínico", `
                ${linha("Vacinação", hc.vacinacao === true ? `Sim ${hc.vacinacaoData ? `(${hc.vacinacaoData})` : ""} ${hc.vacinacaoQuais ? `— ${hc.vacinacaoQuais}` : ""}`.trim() : hc.vacinacao === false ? "Não" : null)}
                ${linha("Controle endoparasitoses", hc.controleEndoparasitoses === true ? `Sim ${hc.controleEndoparasitosesData ? `(${hc.controleEndoparasitosesData})` : ""} ${hc.controleEndoparasitosesQuais ? `— ${hc.controleEndoparasitosesQuais}` : ""}`.trim() : hc.controleEndoparasitoses === false ? "Não" : null)}
                ${linha("Controle ectoparasitoses", hc.controleEctoparasitoses === true ? `Sim ${hc.controleEctoparasitosesData ? `(${hc.controleEctoparasitosesData})` : ""} ${hc.controleEctoparasitosesQuais ? `— ${hc.controleEctoparasitosesQuais}` : ""}`.trim() : hc.controleEctoparasitoses === false ? "Não" : null)}
                ${linha("Uso cont. de medicação", hc.usoMedicacao === true ? `Sim — ${hc.usoMedicacaoDescricao || "—"}` : hc.usoMedicacao === false ? "Não" : null)}
                ${linha("Uso de suplementação", hc.usoSuplementacao === true ? `Sim — ${hc.usoSuplementacaoDescricao || "—"}` : hc.usoSuplementacao === false ? "Não" : null)}
                ${linha("Realizou cirurgias", hc.realizouCirurgias === true ? `Sim — ${hc.realizouCirurgiasDescricao || "—"}` : hc.realizouCirurgias === false ? "Não" : null)}
                ${linha("Possui exame recente", hc.possuiExameRecente === true ? `Sim — ${hc.possuiExameRecenteDescricao || "—"}` : hc.possuiExameRecente === false ? "Não" : null)}
                ${linha("Testado FIV/FeLV", hc.testadoFivFelv === true ? `Sim — ${hc.testadoFivFelvDescricao || "—"}` : hc.testadoFivFelv === false ? "Não" : null)}
                ${linha("Alergia a medicamentos", hc.alergiaMedicamentos === true ? `Sim — ${hc.alergiaMedicamentosDescricao || "—"}` : hc.alergiaMedicamentos === false ? "Não" : null)}
            `)}

            ${parametrosHtml ? sec("Parâmetros clínicos", parametrosHtml) : ""}

            ${sec("Conduta clínica", `<p style="white-space:pre-wrap">${a.condutaClinica || "<em>não informado</em>"}</p>`)}
            ${sec("Tratamentos e exames solicitados", `<p style="white-space:pre-wrap">${a.tratamentosExamesSolicitados || "<em>não informado</em>"}</p>`)}
            ${sec("Retorno", `<p style="white-space:pre-wrap">${a.retorno || "<em>não informado</em>"}</p>`)}

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
