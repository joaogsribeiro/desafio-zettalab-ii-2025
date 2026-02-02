const { Sequelize } = require('sequelize');
const dbConfig = require('../config/database');

// Importa o modelo (a receita do bolo)
const UserModel = require('../models/User');

// Cria a conexão com o banco
const connection = new Sequelize(dbConfig);

// Inicializa o Modelo User com a conexão
const User = UserModel(connection);

// Exporta a conexão e o Modelo User pronto para uso
module.exports = { connection, User };