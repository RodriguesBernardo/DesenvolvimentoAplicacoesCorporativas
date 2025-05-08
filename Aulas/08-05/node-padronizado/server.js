const express = require("express");
const app = express();
app.get("/", (req, res) => {
  res.send("Página Inicial");
});
app.get("/contato", (req, res) => {
  res.send("Página de Contato");
});
const porta = 3000;
app.listen(porta, () => {
  console.log("Servidor rodando na porta " + porta);
});
