const express = require("express");
const connectDB = require("./config/db");
const usuarioRoutes = require("./routes/usuarioRoutes");

const app = express();
connectDB();

app.use(express.json());
app.use("/usuarios", usuarioRoutes);

app.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");
});
