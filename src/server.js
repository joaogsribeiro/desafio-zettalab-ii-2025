const express = require('express');
const cors = require('cors');
const { Sequelize } = require('sequelize');
const dbConfig = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const sequelize = new Sequelize(dbConfig);

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com o banco de dados (Docker) estabelecida!');
    console.log('🚀 Modo Zetta Lab ativado.');

    app.listen(PORT, () => {
      console.log(`📡 Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erro ao conectar no banco:', error);
  }
}

startServer();