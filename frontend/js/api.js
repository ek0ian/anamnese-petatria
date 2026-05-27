// Cliente HTTP minimalista para a API. Adiciona automaticamente o JWT salvo.
const API = (() => {
    const BASE = "http://localhost:5147/api";
    const STORAGE_KEY = "petatria_token";
    const STORAGE_USER = "petatria_user";

    function getToken() {
        return localStorage.getItem(STORAGE_KEY);
    }

    function setToken(token) {
        if (token) localStorage.setItem(STORAGE_KEY, token);
        else localStorage.removeItem(STORAGE_KEY);
    }

    function getUsuario() {
        const raw = localStorage.getItem(STORAGE_USER);
        return raw ? JSON.parse(raw) : null;
    }

    function setUsuario(u) {
        if (u) localStorage.setItem(STORAGE_USER, JSON.stringify(u));
        else localStorage.removeItem(STORAGE_USER);
    }

    async function req(metodo, caminho, corpo) {
        const headers = { "Content-Type": "application/json" };
        const token = getToken();
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const resp = await fetch(`${BASE}${caminho}`, {
            method: metodo,
            headers,
            body: corpo ? JSON.stringify(corpo) : undefined
        });

        if (resp.status === 401) {
            setToken(null);
            setUsuario(null);
            window.location.reload();
            return;
        }

        if (resp.status === 204) return null;
        const ct = resp.headers.get("content-type") || "";
        const data = ct.includes("application/json") ? await resp.json() : await resp.text();

        if (!resp.ok) {
            const erro = (data && data.erro) || `Erro HTTP ${resp.status}`;
            throw new Error(erro);
        }
        return data;
    }

    return {
        // Auth
        login: (email, senha) => req("POST", "/auth/login", { email, senha }),
        registrar: (payload) => req("POST", "/auth/registrar", payload),

        // Tutores
        listarTutores: (busca) =>
            req("GET", `/tutores${busca ? `?busca=${encodeURIComponent(busca)}` : ""}`),
        criarTutor: (payload) => req("POST", "/tutores", payload),

        // Pacientes
        listarPacientes: (busca) =>
            req("GET", `/pacientes${busca ? `?busca=${encodeURIComponent(busca)}` : ""}`),
        obterPaciente: (id) => req("GET", `/pacientes/${id}`),
        criarPaciente: (payload) => req("POST", "/pacientes", payload),

        // Anamneses
        listarAnamneses: (pacienteId) => req("GET", `/anamneses/paciente/${pacienteId}`),
        obterAnamnese: (id) => req("GET", `/anamneses/${id}`),
        criarAnamnese: (payload) => req("POST", "/anamneses", payload),

        // Exames
        categoriasExames: () => req("GET", "/exames/categorias"),
        catalogoExames: (termo) =>
            req("GET", `/exames/catalogo${termo ? `?termo=${encodeURIComponent(termo)}` : ""}`),
        listarExames: (pacienteId) => req("GET", `/exames/paciente/${pacienteId}`),
        obterExame: (id) => req("GET", `/exames/${id}`),
        criarExame: (payload) => req("POST", "/exames", payload),

        // Atestados
        modelosAtestado: () => req("GET", "/atestados/modelos"),
        listarAtestados: (pacienteId) => req("GET", `/atestados/paciente/${pacienteId}`),
        obterAtestado: (id) => req("GET", `/atestados/${id}`),
        criarAtestado: (payload) => req("POST", "/atestados", payload),

        // Utilitarios de sessao
        getToken, setToken, getUsuario, setUsuario
    };
})();
