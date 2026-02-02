require('dotenv').config();

module.exports = {
  secret: process.env.JWT_SECRET, // Pega do .env
  expiresIn: '7d', // O token vale por 7 dias
};