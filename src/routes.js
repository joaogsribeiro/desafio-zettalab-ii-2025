const express = require('express');
const routes = express.Router();

const UserController = require('./controllers/UserController');
const SessionController = require('./controllers/SessionController');
const TaskController = require('./controllers/TaskController');
const TagController = require('./controllers/TagController');
const authMiddleware = require('./middlewares/auth');

// Rotas Públicas
routes.post('/users', UserController.create);
routes.post('/sessions', SessionController.store);

// --- BARREIRA DE SEGURANÇA ---
routes.use(authMiddleware);

// Rotas de Tarefas (Protegidas)
routes.get('/tasks', TaskController.index);        // Listar
routes.post('/tasks', TaskController.create);      // Criar
routes.put('/tasks/:id', TaskController.update);   // Atualizar
routes.delete('/tasks/:id', TaskController.delete); // Deletar

// Rotas de Tags
routes.get('/tags', TagController.index);
routes.post('/tags', TagController.create);

module.exports = routes;