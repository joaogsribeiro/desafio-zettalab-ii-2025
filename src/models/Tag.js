const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Tag = sequelize.define('Tag', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING, // Ex: "#FF0000"
      defaultValue: '#ddd',   // Cinza padrão
    },
    // O user_id será criado automaticamente na relação 1:N
    // (Cada tag pertence a um usuário, para você não ver as tags do vizinho)
  });

  return Tag;
};