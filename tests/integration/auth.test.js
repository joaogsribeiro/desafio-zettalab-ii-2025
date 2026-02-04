const request = require('supertest');
const { setupTestDB, cleanupTestDB, closeTestDB, User, Task, Tag, connection } = require('../helpers/testDb');

// IMPORTANTE: Substitui o database do src pelos modelos de teste
jest.mock('../../src/database', () => {
  const testDb = require('../helpers/testDb');
  return testDb;
});

const app = require('../../src/app');

describe('Authentication Integration Tests', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await cleanupTestDB();
    await closeTestDB();
  });

  beforeEach(async () => {
    // Limpa usuários antes de cada teste
    await User.destroy({ where: {}, force: true });
  });

  describe('POST /users - Create User', () => {
    it('should create a new user with valid data', async () => {
      const userData = {
        name: 'João Silva',
        email: 'joao@test.com',
        password: 'senha123'
      };

      const response = await request(app)
        .post('/users')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('msg', 'Usuário criado com sucesso!');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('name', 'João Silva');
      expect(response.body.user).toHaveProperty('email', 'joao@test.com');
      expect(response.body.user).not.toHaveProperty('password_hash');
    });

    it('should not create user with duplicate email', async () => {
      const userData = {
        name: 'João Silva',
        email: 'joao@test.com',
        password: 'senha123'
      };

      // Cria o primeiro usuário
      await request(app).post('/users').send(userData);

      // Tenta criar outro com mesmo email
      const response = await request(app)
        .post('/users')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('msg', 'Email já cadastrado');
    });

    it('should not create user without required fields', async () => {
      const response = await request(app)
        .post('/users')
        .send({ name: 'João Silva' }) // Falta email e password
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Erro de validação');
      expect(response.body).toHaveProperty('messages');
      expect(Array.isArray(response.body.messages)).toBe(true);
    });

    it('should not create user with invalid email format', async () => {
      const userData = {
        name: 'João Silva',
        email: 'emailinvalido',
        password: 'senha123'
      };

      const response = await request(app)
        .post('/users')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Erro de validação');
      expect(response.body).toHaveProperty('messages');
      expect(Array.isArray(response.body.messages)).toBe(true);
    });
  });

  describe('POST /sessions - Login', () => {
    beforeEach(async () => {
      // Cria um usuário para testes de login
      await request(app).post('/users').send({
        name: 'Test User',
        email: 'test@test.com',
        password: 'senha123'
      });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/sessions')
        .send({
          email: 'test@test.com',
          password: 'senha123'
        })
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('name', 'Test User');
      expect(response.body.user).toHaveProperty('email', 'test@test.com');
      expect(response.body).toHaveProperty('token');
      expect(typeof response.body.token).toBe('string');
    });

    it('should not login with invalid email', async () => {
      const response = await request(app)
        .post('/sessions')
        .send({
          email: 'naocadastrado@test.com',
          password: 'senha123'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Usuário não encontrado');
    });

    it('should not login with invalid password', async () => {
      const response = await request(app)
        .post('/sessions')
        .send({
          email: 'test@test.com',
          password: 'senhaerrada'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Senha incorreta');
    });
  });

  describe('Protected Routes - Authentication Middleware', () => {
    let authToken;

    beforeEach(async () => {
      // Cria usuário e faz login para obter token
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
    });

    it('should access protected route with valid token', async () => {
      const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should not access protected route without token', async () => {
      const response = await request(app)
        .get('/tasks')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Token não fornecido');
    });

    it('should not access protected route with invalid token', async () => {
      const response = await request(app)
        .get('/tasks')
        .set('Authorization', 'Bearer tokeninvalido123')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Token inválido');
    });
  });
});
