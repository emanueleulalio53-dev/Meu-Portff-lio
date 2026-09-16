const form = document.getElementById("loginForm");

const loginInput = document.getElementById("login");
const senhaInput = document.getElementById("senha");
const btnLimpar = document.getElementById("btnLimpar");

const mensagem = document.getElementById("mensagem");


form.addEventListener("submit", async function (event) {

    event.preventDefault();


    const login = loginInput.value.trim();
    const senha = senhaInput.value;


    // Limpa mensagem anterior
    mensagem.textContent = "";


    // ==============================
    // VALIDAÇÕES
    // ==============================

    if (login === "" || senha === "") {

        mensagem.textContent =
            "Preencha usuário e senha.";

        mensagem.style.color = "red";

        return;
    }


    if (senha.length < 6) {

        mensagem.textContent =
            "A senha deve ter pelo menos 6 caracteres.";

        mensagem.style.color = "red";

        return;
    }


    // ==============================
    // ENVIA PARA O SERVIDOR
    // ==============================

    try {

        mensagem.textContent =
            "Verificando login...";

        mensagem.style.color = "#555";


        const resposta = await fetch(
            "http://localhost:3000/api/login",
            {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    email: login,

                    senha: senha

                })

            }
        );


        const dados = await resposta.json();


        // ==============================
        // LOGIN CORRETO
        // ==============================

        if (dados.success) {

            mensagem.textContent =
                "Login realizado com sucesso!";

            mensagem.style.color = "green";


            // Guarda os dados do usuário
            localStorage.setItem(
                "usuario",
                JSON.stringify(dados.user)
            );


            // Vai para o site
            setTimeout(function () {

                window.location.href = "index.html";

            }, 1000);


        } else {

            // ==============================
            // LOGIN INCORRETO
            // ==============================

            mensagem.textContent =
                dados.message ||
                "Usuário ou senha inválidos.";

            mensagem.style.color = "red";

        }


    } catch (erro) {

        console.error(
            "Erro ao realizar login:",
            erro
        );


        mensagem.textContent =
            "Não foi possível conectar ao servidor.";

        mensagem.style.color = "red";

    }

});


// ==============================
// LIMPAR CAMPOS
// ==============================
btnLimpar.addEventListener("click", function () {

    loginInput.value = "";
    senhaInput.value = "";
    mensagem.textContent = "";
    loginInput.focus();

});