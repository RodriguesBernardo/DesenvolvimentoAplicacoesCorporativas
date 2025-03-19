const express = require("express");
const mongoose = require("mongoose");

const app = express();
const PORT = 3000;

// Conectar ao MongoDB
mongoose.connect("mongodb://localhost:27017/exemplo_nosql", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("Conectado ao MongoDB com sucesso!");
}).catch((err) => {
  console.error("Erro ao conectar ao MongoDB:", err);
});

// Criar o modelo de usuário
const UsuarioSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  idade: { type: Number, required: true },
  email: { type: String, required: true, unique: true }
});

const Usuario = mongoose.model("Usuario", UsuarioSchema);

// Middleware para interpretar JSON
app.use(express.json());

// Rota para listar usuários
app.get("/usuarios", async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ message: "Erro ao buscar usuários", error: err });
  }
});

// Rota para criar um usuário
app.post("/usuarios", async (req, res) => {
  try {
    const usuario = new Usuario(req.body);
    await usuario.save();
    res.status(201).json(usuario);
  } catch (err) {
    res.status(400).json({ message: "Erro ao criar usuário", error: err });
  }
});

// Rota para atualizar um usuário
app.put("/usuarios/:id", async (req, res) => {
  try {
    const usuarioAtualizado = await Usuario.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!usuarioAtualizado) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }
    res.json(usuarioAtualizado);
  } catch (err) {
    res.status(400).json({ message: "Erro ao atualizar usuário", error: err });
  }
});

// Rota para excluir um usuário
app.delete("/usuarios/:id", async (req, res) => {
  try {
    const usuarioDeletado = await Usuario.findByIdAndDelete(req.params.id);
    if (!usuarioDeletado) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }
    res.json({ message: "Usuário deletado com sucesso" });
  } catch (err) {
    res.status(500).json({ message: "Erro ao excluir usuário", error: err });
  }
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
