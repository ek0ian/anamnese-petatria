// Geracao de PDF de atestados usando jsPDF (carregado via CDN no index.html).
// Inclui cabecalho com nome da clinica, dados do paciente e do tutor,
// titulo do termo, corpo formatado e linha de assinatura ao final.

const PDFAtestado = (() => {

    const CORES = {
        roxoEscuro: [74, 59, 92],
        roxoMedio: [106, 90, 125],
        textoSuave: [107, 92, 117],
        creme: [248, 242, 238]
    };

    const TITULOS_TIPO = {
        TermoExames: "TERMO PARA REALIZAÇÃO DE EXAMES",
        TermoProcedimentoRisco: "TERMO PARA PROCEDIMENTO TERAPÊUTICO DE RISCO",
        TermoObito: "TERMO DE ÓBITO",
        TermoEutanasia: "TERMO PARA REALIZAÇÃO DE EUTANÁSIA",
        TermoCirurgico: "TERMO PARA REALIZAÇÃO DE PROCEDIMENTOS CIRÚRGICOS",
        TermoRetiradaSemAlta: "TERMO PARA RETIRADA DE ANIMAL SEM ALTA MÉDICA",
        AtestadoEncaminhamento: "ATESTADO DE ENCAMINHAMENTO"
    };

    function fmtData(iso) {
        if (!iso) return "—";
        return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
    }

    function fmtIdade(p) {
        return p.idadeFormatada || "—";
    }

    /**
     * Gera o PDF do atestado e abre o download.
     * @param {object} atestado - registro de AtestadoTermo
     * @param {object} paciente - registro de paciente
     */
    function gerar(atestado, paciente) {
        if (typeof window.jspdf === "undefined") {
            alert("Biblioteca de PDF não carregou. Verifique a conexão e recarregue a página.");
            return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ unit: "mm", format: "a4" });

        const margem = 18;
        const larguraUtil = 210 - margem * 2;
        let y = 0;

        // ===== Cabeçalho =====
        doc.setFillColor(...CORES.roxoEscuro);
        doc.rect(0, 0, 210, 28, "F");

        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text("Anamnese Pet'Atria", margem, 15);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text("Clínica Veterinária — Prontuário Digital", margem, 22);

        y = 40;

        // ===== Título do termo =====
        doc.setTextColor(...CORES.roxoEscuro);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        const titulo = TITULOS_TIPO[atestado.tipo] || "ATESTADO";
        doc.text(titulo, 105, y, { align: "center" });
        y += 8;

        // Linha decorativa
        doc.setDrawColor(...CORES.roxoEscuro);
        doc.setLineWidth(0.5);
        doc.line(margem, y, 210 - margem, y);
        y += 8;

        // ===== Bloco de identificação =====
        doc.setFillColor(...CORES.creme);
        doc.rect(margem, y, larguraUtil, 32, "F");

        doc.setTextColor(...CORES.roxoEscuro);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("IDENTIFICAÇÃO", margem + 4, y + 6);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(40, 30, 60);
        doc.text(`Animal: ${paciente.nome}    (ID ${paciente.codigo})`, margem + 4, y + 13);
        doc.text(`Espécie: ${paciente.especie}    Raça: ${paciente.raca || "—"}    Sexo: ${paciente.sexo}`, margem + 4, y + 20);
        doc.text(`Idade: ${fmtIdade(paciente)}    Tutor(a): ${paciente.tutorNome || "—"}`, margem + 4, y + 27);

        y += 40;

        // ===== Corpo do atestado =====
        doc.setTextColor(40, 30, 60);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        const corpo = atestado.conteudo || "";
        const linhas = doc.splitTextToSize(corpo, larguraUtil);
        doc.text(linhas, margem, y, { lineHeightFactor: 1.5 });
        y += linhas.length * 5.5 + 8;

        // Identificação complementar, se houver
        if (atestado.identificacaoComplementar) {
            doc.setFont("helvetica", "italic");
            doc.setFontSize(10);
            const id = doc.splitTextToSize(atestado.identificacaoComplementar, larguraUtil);
            doc.text(id, margem, y, { lineHeightFactor: 1.4 });
            y += id.length * 5 + 8;
        }

        // ===== Local e data =====
        const cidade = atestado.cidade || "—";
        const dataStr = fmtData(atestado.dataEmissao);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.text(`${cidade}, ${dataStr}.`, margem, y);
        y += 25;

        // ===== Linha de assinatura =====
        doc.setDrawColor(...CORES.textoSuave);
        doc.setLineWidth(0.3);
        doc.line(margem + 30, y, 210 - margem - 30, y);
        doc.setFontSize(9);
        doc.setTextColor(...CORES.textoSuave);
        doc.text("Assinatura do Médico(a) Veterinário(a) responsável", 105, y + 5, { align: "center" });
        doc.text("CRMV: ____________________", 105, y + 11, { align: "center" });

        // ===== Rodapé =====
        const rodapeY = 280;
        doc.setFontSize(8);
        doc.setTextColor(...CORES.textoSuave);
        doc.text("Documento emitido por Anamnese Pet'Atria · prontuário digital", 105, rodapeY, { align: "center" });

        // Salvar
        const arquivo = `${titulo.toLowerCase().replace(/[^\w]+/g, "-")}-${paciente.nome.toLowerCase()}.pdf`;
        doc.save(arquivo);
    }

    return { gerar };
})();
