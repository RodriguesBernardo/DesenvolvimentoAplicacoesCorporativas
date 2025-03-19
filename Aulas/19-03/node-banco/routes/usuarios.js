const express = require("express");
const router = express.Router();
const connection = require("../config/db");

router.get("/", (req, res) => {
    connection.query("SELECT * FROM usuarios", (err, results) => {
        if (err) {
            res.status(500).send("Erro ao buscar usuários");
            return;
        }
        res.json(results);
    });
});

router.post("/", (req, res) => {
    const { nome, idade } = req.body;
    connection.query("INSERT INTO usuarios (nome, idade) VALUES (?, ?)", [nome, idade], (err) => {
        if (err) {
            res.status(500).send("Erro ao inserir usuário");
            return;
        }
        res.status(201).send("Usuário inserido com sucesso");
    });
});

module.exports = router;
