import { supabase } from "./supabase-config.js";

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
    // CADASTRA VIA SUPABASE
    // ==============================

    try {

        mensagem.textContent =
            "Cadastrando...";

        mensagem.style.color = "#555";


        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: senha,
            options: {
                data: {
                    nome: nome
                }
            }
        });


        if (error) {

            mensagem.textContent =
                error.message ||
                "Não foi possível concluir o cadastro.";

            mensagem.style.color = "red";

            return;
        }


        // ==============================
        // CADASTRO REALIZADO
        // ==============================

        if (data.session) {

            // Confirmação de e-mail desativada — já está autenticado
            mensagem.textContent =
                "Cadastro realizado com sucesso! Redirecionando...";

            mensagem.style.color = "green";

            setTimeout(function () {

                window.location.href = "index.html";

            }, 1500);

        } else {

            // Confirmação de e-mail ativada
            mensagem.textContent =
                "Cadastro realizado! Confirme seu e-mail e faça o login.";

            mensagem.style.color = "green";

            setTimeout(function () {

                window.location.href = "login.html";

            }, 2000);

        }


    } catch (erro) {

        console.error(
            "Erro ao realizar cadastro:",
            erro
        );


        mensagem.textContent =
            "Não foi possível conectar ao serviço de autenticação.";

        mensagem.style.color = "red";

    }

});