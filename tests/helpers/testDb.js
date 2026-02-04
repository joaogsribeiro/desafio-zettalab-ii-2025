const { Sequelize } = require('sequelize');
const UserModel = require('../../src/models/User');
const TaskModel = require('../../src/models/Task');
const TagModel = require('../../src/models/Tag');

// Usa SQLite em memória para testes (mais rápido)
const sequelize = new Sequelize('sqlite::memory:', {
  logging: false, // Desativa logs durante testes
  dialect: 'sqlite'
});

// Inicializa os modelos
const User = UserModel(sequelize);
const Task = TaskModel(sequelize);
const Tag = TagModel(sequelize);

// Define relacionamentos
User.hasMany(Task, { foreignKey: 'user_id', as: 'tasks' });
Task.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Tag, { foreignKey: 'user_id', as: 'tags' });
Tag.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Task.belongsToMany(Tag, { through: 'task_tags', as: 'tags', foreignKey: 'task_id' });
Tag.belongsToMany(Task, { through: 'task_tags', as: 'tasks', foreignKey: 'tag_id' });

// Funções auxiliares para testes
const setupTestDB = async () => {
  await sequelize.sync({ force: true }); // Recria todas as tabelas
  
  // Cria tags do sistema
  const systemTags = [
    { name: 'Urgente', color: '#DC2626', user_id: null },
    { name: 'Importante', color: '#EA580C', user_id: null },
    { name: 'Trabalho', color: '#2563EB', user_id: null },
  ];
  
  for (const tag of systemTags) {
    await Tag.create(tag);
  }
};

const cleanupTestDB = async () => {
  await sequelize.drop(); // Remove todas as tabelas
};

const closeTestDB = async () => {
  await sequelize.close();
};

module.exports = {
  sequelize,
  User,
  Task,
  Tag,
  setupTestDB,
  cleanupTestDB,
  closeTestDB
};
