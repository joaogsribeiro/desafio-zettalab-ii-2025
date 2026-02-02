const express = require('express');
const routes = express.Router();

const UserController = require('./controllers/UserController');

// Rota de Cadastro: POST /users
routes.post('/users', UserController.create);

module.exports = routes;