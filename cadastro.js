const form = document.getElementById("cadastroForm");

const nomeInput = document.getElementById("nome");
const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");

const mensagem = document.getElementById("mensagem");


form.addEventListener("submit", async function (event) {

    event.preventDefault();


    const nome = nomeInput.value.trim();
    const email = emailInput.value.trim();
    const senha = senhaInput.value;


    // Limpa mensagem anterior
    mensagem.textContent = "";


    // ==============================
    // VALIDAÇÕES
    // ==============================

    if (nome === "" || email === "" || senha === "") {

        mensagem.textContent =
            "Preencha todos os campos.";

        mensagem.style.color = "red";

        return;
    }


    if (nome.length < 3) {

        mensagem.textContent =
            "Digite seu nome completo.";

        mensagem.style.color = "red";

        return;
    }


    if (!email.includes("@") || !email.includes(".")) {

        mensagem.textContent =
            "Digite um e-mail válido.";

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
            "Cadastrando...";

        mensagem.style.color = "#555";


        const resposta = await fetch(
            "http://localhost:3000/api/cadastro",
            {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    usuario: nome,

                    email: email,

                    senha: senha

                })

            }
        );


        const dados = await resposta.json();


        // ==============================
        // CADASTRO REALIZADO
        // ==============================

        if (dados.success) {

            mensagem.textContent =
                "Cadastro realizado com sucesso! Redirecionando para o login...";

            mensagem.style.color = "green";


            setTimeout(function () {

                window.location.href = "login.html";

            }, 1500);


        } else {

            // ==============================
            // ERRO NO CADASTRO
            // ==============================

            mensagem.textContent =
                dados.message ||
                "Não foi possível concluir o cadastro.";

            mensagem.style.color = "red";

        }


    } catch (erro) {

        console.error(
            "Erro ao realizar cadastro:",
            erro
        );


        mensagem.textContent =
            "Não foi possível conectar ao servidor.";

        mensagem.style.color = "red";

    }

});