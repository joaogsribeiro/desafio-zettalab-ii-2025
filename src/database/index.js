const { Sequelize } = require('sequelize');
const dbConfig = require('../config/database');

// Importa os modelos
const UserModel = require('../models/User');
const TaskModel = require('../models/Task');

// Cria a conexão
const connection = new Sequelize(dbConfig);

// Inicializa os modelos
const User = UserModel(connection);
const Task = TaskModel(connection);

// --- DEFININDO OS RELACIONAMENTOS ---

// 1:N (Um Usuário tem muitas Tarefas)
User.hasMany(Task, { foreignKey: 'user_id', as: 'tasks' });

// N:1 (Uma Tarefa pertence a um Usuário)
Task.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Exporta tudo
module.exports = { connection, User, Task };