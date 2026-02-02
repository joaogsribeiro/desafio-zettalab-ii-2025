const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false, // Campo obrigatório
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Não permite dois usuários com o mesmo email
      validate: {
        isEmail: true, // Validação automática de formato de email
      },
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    hooks: {
      // Hook: Executa ANTES de criar o usuário no banco
      beforeCreate: async (user) => {
        if (user.password_hash) {
          // O "salt" é um valor aleatório para fortalecer a criptografia
          const salt = await bcrypt.genSalt(8);
          user.password_hash = await bcrypt.hash(user.password_hash, salt);
        }
      },
      // Hook: Executa ANTES de atualizar, caso a senha tenha mudado
      beforeUpdate: async (user) => {
        if (user.changed('password_hash')) {
          const salt = await bcrypt.genSalt(8);
          user.password_hash = await bcrypt.hash(user.password_hash, salt);
        }
      },
    }
  });

  // Método auxiliar para checar senha no login (vamos usar mais tarde)
  User.prototype.checkPassword = function(password) {
    return bcrypt.compare(password, this.password_hash);
  };

  return User;
};