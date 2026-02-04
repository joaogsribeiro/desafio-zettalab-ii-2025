require('dotenv').config();

// Se DATABASE_URL estiver definida (Render/produção), usa ela
if (process.env.DATABASE_URL) {
  module.exports = {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    url: process.env.DATABASE_URL,
    define: {
      timestamps: true,
      underscored: true,
    },
  };
} else {
  // Caso contrário, usa variáveis separadas (desenvolvimento local)
  module.exports = {
    dialect: 'postgres',
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    define: {
      timestamps: true,
      underscored: true,
    },
  };
}