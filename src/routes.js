const express = require('express');
const routes = express.Router();

const UserController = require('./controllers/UserController');
const SessionController = require('./controllers/SessionController');

// Importa o Middleware
const authMiddleware = require('./middlewares/auth');

// Rotas Públicas (Todo mundo pode acessar)
routes.post('/users', UserController.create);
routes.post('/sessions', SessionController.store);

// --- BARREIRA DE SEGURANÇA ---
// Tudo que estiver abaixo desta linha exigirá o Token
routes.use(authMiddleware);

// Rotas Privadas (Aqui virão as tarefas...)
// Exemplo: routes.post('/tasks', TaskController.create);

module.exports = routes;