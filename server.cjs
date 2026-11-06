const express = require('express');

const app = express();
app.use(express.json());

// Requisição GET para verificar o servidor
app.get('/api/status', (req, res) => {
    res.status(200).json({
        projeto: 'Portfolio 2026',
        status: 'online',
        mensagem: 'Minha API está funcionando!'
    });
});

// Requisição POST para receber dados enviados pelo Bruno
app.post('/api/teste', (req, res) => {
    const { mensagem } = req.body || {};

    if (typeof mensagem !== 'string' || !mensagem.trim()) {
        return res.status(400).json({
            erro: 'Envie uma mensagem em formato JSON.'
        });
    }

    res.status(200).json({
        resultado: 'Requisição recebida com sucesso!',
        mensagemRecebida: mensagem
    });
});

const PORTA = 3000;

app.listen(PORTA, '127.0.0.1', () => {
    console.log(`API funcionando em http://localhost:${PORTA}`);
});