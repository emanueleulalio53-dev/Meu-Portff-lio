const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

// ========================================
// MIDDLEWARE
// ========================================
app.use(cors());
app.use(express.json());

// ========================================
// CONEXÃO COM MYSQL
// ========================================
const db = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "portfoliologin" // Atualizado para o nome correto do banco
});

db.connect((err) => {
    if (err) {
        console.error("Erro ao conectar ao MySQL:", err.message);
        return;
    }
    console.log("Conectado ao MySQL com sucesso!");
});

// ========================================
// 1. ROTA DE LOGIN
// ========================================
app.post("/api/login", (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ success: false, message: "E-mail e senha são obrigatórios." });
    }

    // Alterado de 'nome' para 'usuario' conforme a estrutura da tabela
    const sql = "SELECT id, usuario, email FROM usuarios WHERE email = ? AND senha = ? LIMIT 1";

    db.query(sql, [email, senha], (err, results) => {
        if (err) {
            console.error("Erro ao consultar usuário:", err.message);
            return res.status(500).json({ success: false, message: "Erro interno no servidor." });
        }

        if (results.length > 0) {
            const user = results[0];
            return res.json({
                success: true,
                message: "Login realizado com sucesso!",
                // Retornando 'usuario' no lugar de 'nome'
                user: { id: user.id, usuario: user.usuario, email: user.email }
            });
        }
        return res.status(401).json({ success: false, message: "E-mail ou senha inválidos!" });
    });
});

// ========================================
// 2. ROTA DE CADASTRO
// ========================================
app.post("/api/cadastro", (req, res) => {
    // Alterado de 'nome' para 'usuario' no req.body
    const { usuario, email, senha } = req.body;

    if (!usuario || !email || !senha) {
        return res.status(400).json({ success: false, message: "Todos os campos são obrigatórios." });
    }

    // Inserindo na coluna 'usuario'
    const sql = "INSERT INTO usuarios (usuario, email, senha) VALUES (?, ?, ?)";

    db.query(sql, [usuario, email, senha], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ success: false, message: "Este usuário ou e-mail já está cadastrado!" });
            }
            console.error("Erro ao cadastrar usuário:", err.message);
            return res.status(500).json({ success: false, message: "Erro interno no servidor." });
        }
        return res.json({ success: true, message: "Cadastro realizado com sucesso!" });
    });
});

// ========================================
// 3. ROTAS DE AUXÍLIO PARA AGENDAMENTO
// ========================================
app.get("/api/servicos", (req, res) => {
    db.query("SELECT id_servico, nome, preco FROM servicos WHERE ativo = 1", (err, results) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, servicos: results });
    });
});

app.get("/api/barbeiros", (req, res) => {
    db.query("SELECT id_barbeiro, nome FROM barbeiros WHERE ativo = 1", (err, results) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, barbeiros: results });
    });
});

// ========================================
// 4. ROTA DE AGENDAMENTO
// ========================================
app.post("/api/agendamento", (req, res) => {
    const { nome, telefone, email, id_servico, id_barbeiro, data, hora, observacao } = req.body;

    if (!nome || !telefone || !email || !id_servico || !id_barbeiro || !data || !hora) {
        return res.status(400).json({ success: false, message: "Preencha todos os campos obrigatórios." });
    }

    const checkDisponibilidadeSQL = "SELECT id_agendamento FROM agendamentos WHERE id_barbeiro = ? AND data_agendamento = ? AND hora_agendamento = ?";
    
    db.query(checkDisponibilidadeSQL, [id_barbeiro, data, hora], (err, resultadosOcupados) => {
        if (err) {
            console.error("Erro ao verificar disponibilidade:", err.message);
            return res.status(500).json({ success: false, message: "Erro interno ao verificar disponibilidade." });
        }

        if (resultadosOcupados.length > 0) {
            return res.status(400).json({ success: false, message: "Este barbeiro já possui um agendamento neste dia e horário." });
        }

        const checkClienteSQL = "SELECT id_cliente FROM clientes WHERE email = ?";
        
        db.query(checkClienteSQL, [email], (err, resultadosCliente) => {
            if (err) {
                console.error("Erro ao buscar cliente:", err.message);
                return res.status(500).json({ success: false, message: "Erro interno ao processar dados do cliente." });
            }

            if (resultadosCliente.length > 0) {
                const id_cliente = resultadosCliente[0].id_cliente;
                inserirAgendamentoFinal(id_cliente, id_barbeiro, id_servico, data, hora, observacao, res);
            } else {
                const insertClienteSQL = "INSERT INTO clientes (nome, telefone, email) VALUES (?, ?, ?)";
                db.query(insertClienteSQL, [nome, telefone, email], (err, resultadoInsertCliente) => {
                    if (err) {
                        console.error("Erro ao cadastrar cliente:", err.message);
                        return res.status(500).json({ success: false, message: "Erro ao registrar os dados do cliente." });
                    }
                    const novo_id_cliente = resultadoInsertCliente.insertId;
                    inserirAgendamentoFinal(novo_id_cliente, id_barbeiro, id_servico, data, hora, observacao, res);
                });
            }
        });
    });
});

function inserirAgendamentoFinal(id_cliente, id_barbeiro, id_servico, data, hora, observacao, res) {
    const insertAgendamentoSQL = `
        INSERT INTO agendamentos 
        (id_cliente, id_barbeiro, id_servico, data_agendamento, hora_agendamento, observacao, status) 
        VALUES (?, ?, ?, ?, ?, ?, 'agendado')
    `;

    db.query(insertAgendamentoSQL, [id_cliente, id_barbeiro, id_servico, data, hora, observacao || null], (err, resultadoAgendamento) => {
        if (err) {
            console.error("Erro ao inserir agendamento:", err.message);
            return res.status(500).json({ success: false, message: "Erro ao salvar o agendamento no banco de dados." });
        }
        
        return res.json({ success: true, message: "Agendamento realizado com sucesso!" });
    });
}

// ========================================
// INICIAR SERVIDOR
// ========================================
app.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");
});