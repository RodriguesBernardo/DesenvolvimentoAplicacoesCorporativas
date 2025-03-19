const mongoose = require("mongoose");

const usuarioSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    idade: { type: Number, required: true },
    email: { type: String, required: true, unique: true },
});

module.exports = mongoose.model("Usuario", usuarioSchema);
