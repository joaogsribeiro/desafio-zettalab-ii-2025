const express = require('express');
const routes = express.Router();

const UserController = require('./controllers/UserController');
const SessionController = require('./controllers/SessionController');
const TaskController = require('./controllers/TaskController');
const TagController = require('./controllers/TagController');

const authMiddleware = require('./middlewares/auth');

// --- IMPORTA OS VALIDADORES ---
const UserValidator = require('./validators/UserValidator');
const TaskValidator = require('./validators/TaskValidator');

// Rotas Públicas
// Adicione o validador ANTES do controller
routes.post('/users', UserValidator.validateCreate, UserController.create);
routes.post('/sessions', SessionController.store); 

// --- BARREIRA DE SEGURANÇA ---
routes.use(authMiddleware);

// Rotas de Tarefas
routes.get('/tasks', TaskController.index);
// Adicione o validador aqui também
routes.post('/tasks', TaskValidator.validateCreate, TaskController.create); 
routes.put('/tasks/:id', TaskController.update);
routes.delete('/tasks/:id', TaskController.delete);

// Rotas de Tags
routes.get('/tags', TagController.index);
routes.post('/tags', TagController.create);

module.exports = routes;