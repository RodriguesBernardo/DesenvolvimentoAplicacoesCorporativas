const express = require("express");
const morgan = require("morgan");

const app = express();
const PORT = 3000;

// Middleware para processar JSON e URL encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para log das requisições
app.use(morgan("dev"));

// Middleware de autenticação
const checkAuth = (req, res, next) => {
  const autenticado = true; // Alterar para `false` para simular usuário não autenticado
  if (autenticado) {
    next();
  } else {
    res.status(401).json({ message: "Acesso negado" });
  }
};

// Rota inicial
app.get("/", (req, res) => {
  res.send("Bem-vindo ao Express!");
});

// Rotas de produtos
app.get("/produtos", (req, res) => {
  res.json({ message: "Listando todos os produtos", produtos: [] });
});

app.post("/produtos", (req, res) => {
  const { nome, preco } = req.body;
  res.json({
    message: "Produto criado",
    produto: { id: Date.now(), nome, preco },
  });
});

app.put("/produtos/:id", (req, res) => {
  const { id } = req.params;
  res.json({ message: "Produto atualizado", produto: { id, nome: "Novo Nome" } });
});

app.delete("/produtos/:id", (req, res) => {
  const { id } = req.params;
  res.json({ message: "Produto excluído", produtoId: id });
});

// Rota protegida com middleware de autenticação
app.get("/dashboard", checkAuth, (req, res) => {
  res.json({ message: "Bem-vindo ao painel" });
});

// Manipulação de parâmetros de rota
app.get("/usuarios/:id", (req, res) => {
  res.json({ message: `Buscando o usuário com ID: ${req.params.id}` });
});

// Manipulação de query strings
app.get("/filtro", (req, res) => {
  const { categoria, precoMaximo } = req.query;
  res.json({
    message: "Filtrando produtos",
    filtros: { categoria: categoria || "Todas", precoMaximo: precoMaximo || "Sem limite" },
  });
});

// Iniciando o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
