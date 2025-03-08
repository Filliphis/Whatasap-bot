require('dotenv').config(); // Carrega as variáveis de ambiente
const express = require('express');
const cors = require('cors');
const consultaCpfRoutes = require('./routes/consultaCpfRoutes'); // Importa as rotas de consulta de CPF

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

app.use('/consulta-cpf', consultaCpfRoutes); // Usa as rotas de consulta de CPF

app.listen(PORT, () => {
    console.log(`API rodando na porta ${PORT}`);
});