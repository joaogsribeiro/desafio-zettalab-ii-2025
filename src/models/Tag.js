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
    // user_id será criado automaticamente na relação 1:N
    // Se for NULL = tag do sistema (disponível para todos)
    // Se tiver valor = tag personalizada do usuário
  });

  return Tag;
};