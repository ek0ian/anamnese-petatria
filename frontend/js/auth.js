// Logica de login/registro. Alterna entre os dois formularios na tela de login
// e troca para a view do app apos autenticar.

const Auth = (() => {
    function init() {
        document.getElementById("link-mostrar-registro").addEventListener("click", e => {
            e.preventDefault();
            alternar("registro");
        });
        document.getElementById("link-mostrar-login").addEventListener("click", e => {
            e.preventDefault();
            alternar("login");
        });

        document.getElementById("form-login").addEventListener("submit", entrar);
        document.getElementById("form-registro").addEventListener("submit", registrar);
        document.getElementById("btn-sair").addEventListener("click", sair);

        if (API.getToken() && API.getUsuario()) {
            mostrarApp(API.getUsuario());
        } else {
            mostrarLogin();
        }
    }

    function alternar(qual) {
        const login = document.getElementById("form-login");
        const reg = document.getElementById("form-registro");
        login.hidden = qual !== "login";
        reg.hidden = qual !== "registro";
        document.getElementById("msg-login").hidden = true;
        document.getElementById("msg-registro").hidden = true;
    }

    async function entrar(e) {
        e.preventDefault();
        const f = e.target;
        const erro = document.getElementById("msg-login");
        erro.hidden = true;
        try {
            const data = await API.login(f.email.value, f.senha.value);
            API.setToken(data.token);
            API.setUsuario({ nome: data.nome, email: data.email, perfil: data.perfil });
            mostrarApp({ nome: data.nome, email: data.email, perfil: data.perfil });
        } catch (ex) {
            erro.textContent = ex.message;
            erro.hidden = false;
        }
    }

    async function registrar(e) {
        e.preventDefault();
        const f = e.target;
        const erro = document.getElementById("msg-registro");
        erro.hidden = true;
        try {
            const data = await API.registrar({
                nome: f.nome.value,
                email: f.email.value,
                senha: f.senha.value,
                perfil: f.perfil.value
            });
            API.setToken(data.token);
            API.setUsuario({ nome: data.nome, email: data.email, perfil: data.perfil });
            mostrarApp({ nome: data.nome, email: data.email, perfil: data.perfil });
        } catch (ex) {
            erro.textContent = ex.message;
            erro.hidden = false;
        }
    }

    function sair() {
        API.setToken(null);
        API.setUsuario(null);
        window.location.reload();
    }

    function mostrarLogin() {
        document.getElementById("view-login").classList.add("ativa");
        document.getElementById("view-app").hidden = true;
        document.getElementById("view-app").classList.remove("ativa");
    }

    function mostrarApp(usuario) {
        document.getElementById("view-login").classList.remove("ativa");
        document.getElementById("view-login").style.display = "none";
        const app = document.getElementById("view-app");
        app.hidden = false;
        app.classList.add("ativa");
        app.style.display = "block";

        document.getElementById("user-nome").textContent = usuario.nome;
        document.getElementById("user-perfil").textContent = usuario.perfil;
        document.getElementById("user-iniciais").textContent =
            usuario.nome.split(/\s+/).slice(0, 2).map(s => s[0]).join("").toUpperCase();

        if (typeof App !== "undefined" && App.iniciar) App.iniciar();
    }

    return { init };
})();
