const request = require('supertest');
const { setupTestDB, cleanupTestDB, closeTestDB, User, Task, Tag, connection } = require('../helpers/testDb');

// IMPORTANTE: Substitui o database do src pelos modelos de teste
jest.mock('../../src/database', () => {
  const testDb = require('../helpers/testDb');
  return testDb;
});

const app = require('../../src/app');

describe('Tasks Integration Tests', () => {
  let authToken;
  let userId;
  let systemTagId;

  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await cleanupTestDB();
    await closeTestDB();
  });

  beforeEach(async () => {
    // Limpa dados antes de cada teste
    await Task.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });

    // Cria usuário e faz login
    await request(app).post('/users').send({
      name: 'Test User',
      email: 'test@test.com',
      password: 'senha123'
    });

    const loginResponse = await request(app)
      .post('/sessions')
      .send({
        email: 'test@test.com',
        password: 'senha123'
      });

    authToken = loginResponse.body.token;
    userId = loginResponse.body.user.id;

    // Pega uma tag do sistema para usar nos testes
    const systemTag = await Tag.findOne({ where: { user_id: null } });
    systemTagId = systemTag.id;
  });

  describe('GET /tasks - List Tasks', () => {
    beforeEach(async () => {
      // Cria algumas tarefas de teste
      await Task.create({
        user_id: userId,
        title: 'Tarefa 1',
        description: 'Descrição 1',
        status: 'PENDING'
      });

      await Task.create({
        user_id: userId,
        title: 'Tarefa 2',
        description: 'Descrição 2',
        status: 'COMPLETED'
      });
    });

    it('should list all user tasks', async () => {
      const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('title');
      expect(response.body[0]).toHaveProperty('status');
    });

    it('should filter tasks by status PENDING', async () => {
      const response = await request(app)
        .get('/tasks?status=PENDING')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].status).toBe('PENDING');
    });

    it('should filter tasks by status COMPLETED', async () => {
      const response = await request(app)
        .get('/tasks?status=COMPLETED')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].status).toBe('COMPLETED');
    });

    it('should filter tasks by tag_id', async () => {
      // Cria tarefa com tag
      const task = await Task.create({
        user_id: userId,
        title: 'Tarefa com tag',
        description: 'Descrição',
        status: 'PENDING'
      });

      await task.addTag(systemTagId);

      const response = await request(app)
        .get(`/tasks?tag_id=${systemTagId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe('Tarefa com tag');
    });
  });

  describe('POST /tasks - Create Task', () => {
    it('should create a task without tags', async () => {
      const taskData = {
        title: 'Nova Tarefa',
        description: 'Descrição da nova tarefa',
        status: 'PENDING'
      };

      const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(201);

      expect(response.body).toHaveProperty('msg', 'Tarefa criada com sucesso');
      expect(response.body.task).toHaveProperty('id');
      expect(response.body.task).toHaveProperty('title', 'Nova Tarefa');
      expect(response.body.task).toHaveProperty('status', 'PENDING');
      expect(response.body.task).toHaveProperty('tags');
      expect(Array.isArray(response.body.task.tags)).toBe(true);
    });

    it('should create a task with system tags', async () => {
      const taskData = {
        title: 'Tarefa com tags',
        description: 'Descrição',
        status: 'PENDING',
        tags: [systemTagId]
      };

      const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(201);

      expect(response.body.task).toHaveProperty('tags');
      expect(Array.isArray(response.body.task.tags)).toBe(true);
      expect(response.body.task.tags).toHaveLength(1);
    });

    it('should not create task without required fields', async () => {
      const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({}) // Sem dados
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Erro de validação');
    });

    it('should not create task with invalid tag_ids', async () => {
      const taskData = {
        title: 'Tarefa',
        description: 'Descrição',
        status: 'PENDING',
        tags: [99999] // Tag que não existe
      };

      const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('não encontrada(s)');
    });
  });

  describe('PUT /tasks/:id - Update Task', () => {
    let taskId;

    beforeEach(async () => {
      const task = await Task.create({
        user_id: userId,
        title: 'Tarefa Original',
        description: 'Descrição Original',
        status: 'PENDING'
      });
      taskId = task.id;
    });

    it('should update task title and description', async () => {
      const updateData = {
        title: 'Tarefa Atualizada',
        description: 'Descrição Atualizada'
      };

      const response = await request(app)
        .put(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('msg', 'Tarefa atualizada com sucesso');
      expect(response.body.task.title).toBe('Tarefa Atualizada');
      expect(response.body.task.description).toBe('Descrição Atualizada');
    });

    it('should update task status to COMPLETED', async () => {
      const updateData = {
        status: 'COMPLETED'
      };

      const response = await request(app)
        .put(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.task.status).toBe('COMPLETED');
    });

    it('should update task tags', async () => {
      const updateData = {
        tags: [systemTagId]
      };

      const response = await request(app)
        .put(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.task.tags).toHaveLength(1);
    });

    it('should not update task of another user', async () => {
      // Cria outro usuário
      await request(app).post('/users').send({
        name: 'Other User',
        email: 'other@test.com',
        password: 'senha123'
      });

      const otherLoginResponse = await request(app)
        .post('/sessions')
        .send({
          email: 'other@test.com',
          password: 'senha123'
        });

      const otherToken = otherLoginResponse.body.token;

      // Tenta atualizar tarefa do primeiro usuário
      const response = await request(app)
        .put(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ title: 'Hack' })
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Tarefa não encontrada');
    });

    it('should not update with invalid task id', async () => {
      const response = await request(app)
        .put('/tasks/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Teste' })
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Tarefa não encontrada');
    });
  });

  describe('DELETE /tasks/:id - Delete Task', () => {
    let taskId;

    beforeEach(async () => {
      const task = await Task.create({
        user_id: userId,
        title: 'Tarefa para deletar',
        description: 'Descrição',
        status: 'PENDING'
      });
      taskId = task.id;
    });

    it('should delete task', async () => {
      const response = await request(app)
        .delete(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('msg', 'Tarefa deletada com sucesso');

      // Verifica se foi realmente deletada
      const deletedTask = await Task.findByPk(taskId);
      expect(deletedTask).toBeNull();
    });

    it('should not delete task of another user', async () => {
      // Cria outro usuário
      await request(app).post('/users').send({
        name: 'Other User',
        email: 'other@test.com',
        password: 'senha123'
      });

      const otherLoginResponse = await request(app)
        .post('/sessions')
        .send({
          email: 'other@test.com',
          password: 'senha123'
        });

      const otherToken = otherLoginResponse.body.token;

      // Tenta deletar tarefa do primeiro usuário
      const response = await request(app)
        .delete(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Tarefa não encontrada');

      // Verifica que a tarefa ainda existe
      const task = await Task.findByPk(taskId);
      expect(task).not.toBeNull();
    });

    it('should not delete with invalid task id', async () => {
      const response = await request(app)
        .delete('/tasks/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Tarefa não encontrada');
    });
  });
});
