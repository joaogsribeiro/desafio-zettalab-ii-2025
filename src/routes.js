const express = require("express");
const routes = express.Router();

const UserController = require("./controllers/UserController");
const SessionController = require("./controllers/SessionController");
const TaskController = require("./controllers/TaskController");
const TagController = require("./controllers/TagController");

const authMiddleware = require("./middlewares/auth");

// --- IMPORTA OS VALIDADORES ---
const UserValidator = require("./validators/UserValidator");
const TaskValidator = require("./validators/TaskValidator");
const TagValidator = require("./validators/TagValidator");

// Rota raiz - informações da API
routes.get("/", (req, res) => {
  res.json({
    message: "🚀 Task Manager API - ZettaLab Challenge",
    version: "1.0.0",
    documentation: "/api-docs",
    endpoints: {
      users: "/users",
      sessions: "/sessions",
      tasks: "/tasks",
      tags: "/tags"
    }
  });
});

// Rotas Públicas

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Cria um novo usuário
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: João Silva
 *               email:
 *                 type: string
 *                 example: joao@email.com
 *               password:
 *                 type: string
 *                 example: senha123
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *       400:
 *         description: Dados inválidos ou email já cadastrado
 */
routes.post("/users", UserValidator.validateCreate, UserController.create);

/**
 * @swagger
 * /sessions:
 *   post:
 *     summary: Realiza o login do usuário
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: joao@email.com
 *               password:
 *                 type: string
 *                 example: senha123
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                 token:
 *                   type: string
 *       401:
 *         description: Credenciais inválidas
 */
routes.post("/sessions", SessionController.store);

// --- BARREIRA DE SEGURANÇA ---
routes.use(authMiddleware);

// Rotas de Tarefas

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Lista todas as tarefas do usuário autenticado
 *     tags: [Tarefas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, COMPLETED]
 *         description: Filtrar tarefas por status
 *       - in: query
 *         name: tag_id
 *         schema:
 *           type: integer
 *         description: Filtrar tarefas por ID da tag
 *     responses:
 *       200:
 *         description: Lista de tarefas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   status:
 *                     type: string
 *                     enum: [PENDING, COMPLETED]
 *                   user_id:
 *                     type: integer
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                   tags:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         name:
 *                           type: string
 *                         color:
 *                           type: string
 *       401:
 *         description: Token não fornecido ou inválido
 */
routes.get("/tasks", TaskController.index);

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Cria uma nova tarefa
 *     tags: [Tarefas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: Estudar Node.js
 *               description:
 *                 type: string
 *                 example: Revisar conceitos de Express e middleware
 *               tags:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2]
 *                 description: Array com IDs das tags
 *     responses:
 *       201:
 *         description: Tarefa criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Tarefa criada com sucesso
 *                 task:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     status:
 *                       type: string
 *                     user_id:
 *                       type: integer
 *                     tags:
 *                       type: array
 *                       items:
 *                         type: object
 *       400:
 *         description: Título obrigatório ou tag(s) não encontrada(s)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Tag(s) não encontrada(s) ou você não tem acesso: 99"
 *       401:
 *         description: Token não fornecido ou inválido
 */
routes.post("/tasks", TaskValidator.validateCreate, TaskController.create);

/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Atualiza uma tarefa existente
 *     tags: [Tarefas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da tarefa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Estudar Node.js - Avançado
 *               description:
 *                 type: string
 *                 example: Aprofundar em async/await
 *               status:
 *                 type: string
 *                 enum: [PENDING, COMPLETED]
 *                 example: COMPLETED
 *               tags:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 3]
 *     responses:
 *       200:
 *         description: Tarefa atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Tarefa atualizada com sucesso
 *                 task:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     status:
 *                       type: string
 *                     user_id:
 *                       type: integer
 *                     tags:
 *                       type: array
 *                       items:
 *                         type: object
 *       400:
 *         description: Tag(s) não encontrada(s) ou você não tem acesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Tag(s) não encontrada(s) ou você não tem acesso: 99"
 *       404:
 *         description: Tarefa não encontrada
 *       401:
 *         description: Token não fornecido ou inválido
 */
routes.put("/tasks/:id", TaskController.update);

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Deleta uma tarefa
 *     tags: [Tarefas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da tarefa
 *     responses:
 *       200:
 *         description: Tarefa deletada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Tarefa deletada com sucesso
 *       404:
 *         description: Tarefa não encontrada
 *       401:
 *         description: Token não fornecido ou inválido
 */
routes.delete("/tasks/:id", TaskController.delete);

// Rotas de Tags

/**
 * @swagger
 * /tags:
 *   get:
 *     summary: Lista todas as tags disponíveis
 *     description: Retorna tags do sistema (disponíveis para todos) e tags personalizadas do usuário autenticado
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tags (sistema + personalizadas do usuário)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   color:
 *                     type: string
 *                   user_id:
 *                     type: integer
 *                     nullable: true
 *                     description: null = tag do sistema, número = tag personalizada
 *       401:
 *         description: Token não fornecido ou inválido
 */
routes.get("/tags", TagController.index);

/**
 * @swagger
 * /tags:
 *   post:
 *     summary: Cria uma nova tag personalizada
 *     description: Cria uma tag personalizada do usuário. Não é possível criar tags com nomes de tags do sistema.
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Projeto X
 *                 description: Nome da tag (não pode duplicar tags do sistema)
 *               color:
 *                 type: string
 *                 example: "#9333EA"
 *                 description: Cor em hexadecimal (#RGB ou #RRGGBB, opcional, padrão é #ddd)
 *     responses:
 *       201:
 *         description: Tag criada com sucesso (ou já existia - idempotente)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Tag criada com sucesso
 *                   description: Indica se foi criada ou já existia
 *                 tag:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     color:
 *                       type: string
 *                     user_id:
 *                       type: integer
 *                 created:
 *                   type: boolean
 *                   example: true
 *                   description: true se foi criada, false se já existia
 *       400:
 *         description: Validação falhou (nome obrigatório, cor inválida) ou conflito com tag do sistema
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Erro de validação
 *                 messages:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Cor inválida. Use formato hexadecimal (#RRGGBB ou #RGB)"]
 *       401:
 *         description: Token não fornecido ou inválido
 */
routes.post("/tags", TagValidator.validateCreate, TagController.create);

module.exports = routes;
