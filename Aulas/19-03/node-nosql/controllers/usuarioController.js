const Usuario = require("../models/Usuario");

exports.criarUsuario = async (req, res) => {
    try {
        const usuario = new Usuario(req.body);
        await usuario.save();
        res.status(201).json(usuario);
    } catch (error) {
        res.status(400).json({ message: "Erro ao criar usuário", error });
    }
};

exports.obterUsuarios = async (req, res) => {
    const usuarios = await Usuario.find();
    res.json(usuarios);
};
