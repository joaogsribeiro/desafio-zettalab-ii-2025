const express = require('express');
const cors = require('cors');
const { connection } = require('./database'); // Importa só a conexão
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(routes);

async function startServer() {
  try {
    // Testa a conexão que vem do arquivo database/index.js
    await connection.authenticate();
    console.log('✅ Conexão com o banco estabelecida!');

    await connection.sync({ force: false });
    console.log('📦 Tabelas sincronizadas.');

    app.listen(PORT, () => {
      console.log(`📡 Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar:', error);
  }
}

startServer();