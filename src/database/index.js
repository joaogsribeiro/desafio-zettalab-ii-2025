const { Sequelize } = require('sequelize');
const dbConfig = require('../config/database');

// Importa os modelos
const UserModel = require('../models/User');
const TaskModel = require('../models/Task');
const TagModel = require('../models/Tag'); // <--- Novo!

// Cria a conexão
// Se dbConfig tem 'url', usa ela diretamente, senão usa o objeto completo
const connection = dbConfig.url 
  ? new Sequelize(dbConfig.url, dbConfig)
  : new Sequelize(dbConfig);

// Inicializa os modelos
const User = UserModel(connection);
const Task = TaskModel(connection);
const Tag = TagModel(connection); // <--- Novo!

// --- DEFININDO OS RELACIONAMENTOS ---

// 1. Usuário e Tarefas (Já existia)
User.hasMany(Task, { foreignKey: 'user_id', as: 'tasks' });
Task.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// 2. Usuário e Tags (Novo: O usuário é dono das suas tags)
User.hasMany(Tag, { foreignKey: 'user_id', as: 'tags' });
Tag.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// 3. RELACIONAMENTO N:N (Muitos-para-Muitos) - O DIFERENCIAL TÉCNICO
// O Sequelize vai criar uma tabela automática chamada 'task_tags' para unir os dois
Task.belongsToMany(Tag, { through: 'task_tags', as: 'tags', foreignKey: 'task_id' });
Tag.belongsToMany(Task, { through: 'task_tags', as: 'tasks', foreignKey: 'tag_id' });

// Exporta tudo
module.exports = { connection, User, Task, Tag };