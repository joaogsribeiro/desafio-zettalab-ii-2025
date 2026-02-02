const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Task = sequelize.define('Task', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true, // Descrição pode ser opcional
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'COMPLETED'),
      defaultValue: 'PENDING',
      allowNull: false,
    },
    // A Chave Estrangeira (user_id) será criada automaticamente pelo Sequelize
    // quando definirmos a associação no próximo passo.
  });

  return Task;
};