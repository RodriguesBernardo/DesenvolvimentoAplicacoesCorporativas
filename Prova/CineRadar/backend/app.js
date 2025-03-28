// backend/app.js
const express = require('express');
const cors = require('cors');
const app = express();

// Importações corretas
const userRoutes = require('./routes/userRoutes');
const movieRoutes = require('./routes/movieRoutes'); // Se existir

app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/users', userRoutes);
app.use('/api/movies', movieRoutes); // Se existir

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));