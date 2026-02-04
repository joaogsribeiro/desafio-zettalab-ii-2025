const request = require('supertest');
const { setupTestDB, cleanupTestDB, closeTestDB, User, Tag, connection } = require('../helpers/testDb');

// IMPORTANTE: Substitui o database do src pelos modelos de teste
jest.mock('../../src/database', () => {
  const testDb = require('../helpers/testDb');
  return testDb;
});

const app = require('../../src/app');

describe('Tags Integration Tests', () => {
  let authToken;
  let userId;
  let systemTagId;
  let systemTagName;

  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await cleanupTestDB();
    await closeTestDB();
  });

  beforeEach(async () => {
    // Limpa apenas as tags pessoais (não as do sistema)
    await Tag.destroy({ where: { user_id: { $ne: null } }, force: true });
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

    // Pega uma tag do sistema para testes
    const systemTag = await Tag.findOne({ where: { user_id: null } });
    systemTagId = systemTag.id;
    systemTagName = systemTag.name;
  });

  describe('GET /tags - List Tags', () => {
    beforeEach(async () => {
      // Cria algumas tags pessoais
      await Tag.create({
        user_id: userId,
        name: 'Minha Tag 1',
        color: '#FF0000'
      });

      await Tag.create({
        user_id: userId,
        name: 'Minha Tag 2',
        color: '#00FF00'
      });
    });

    it('should list system tags and user tags', async () => {
      const response = await request(app)
        .get('/tags')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      // Deve ter pelo menos 2 pessoais
      expect(response.body.length).toBeGreaterThanOrEqual(2);
      
      // Verifica se tem tags do sistema
      const systemTags = response.body.filter(tag => tag.user_id === null);
      expect(systemTags.length).toBeGreaterThan(0);
      
      // Verifica se tem tags pessoais
      const userTags = response.body.filter(tag => tag.user_id === userId);
      expect(userTags.length).toBe(2);
    });

    it('should not list tags from other users', async () => {
      // Cria outro usuário com suas tags
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

      const otherUserId = otherLoginResponse.body.user.id;

      await Tag.create({
        user_id: otherUserId,
        name: 'Tag do Outro',
        color: '#0000FF'
      });

      // Lista tags do primeiro usuário
      const response = await request(app)
        .get('/tags')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Não deve incluir a tag do outro usuário
      const otherUserTags = response.body.filter(tag => tag.name === 'Tag do Outro');
      expect(otherUserTags).toHaveLength(0);
    });
  });

  describe('POST /tags - Create Tag', () => {
    it('should create a personal tag', async () => {
      const tagData = {
        name: 'Nova Tag Pessoal',
        color: '#FF5733'
      };

      const response = await request(app)
        .post('/tags')
        .set('Authorization', `Bearer ${authToken}`)
        .send(tagData)
        .expect(201);

      expect(response.body).toHaveProperty('msg', 'Tag criada com sucesso');
      expect(response.body.tag).toHaveProperty('id');
      expect(response.body.tag).toHaveProperty('name', 'Nova Tag Pessoal');
      expect(response.body.tag).toHaveProperty('color', '#FF5733');
      expect(response.body.tag).toHaveProperty('user_id', userId);
    });

    it('should create tag with default color if not provided', async () => {
      const tagData = {
        name: 'Tag sem cor'
      };

      const response = await request(app)
        .post('/tags')
        .set('Authorization', `Bearer ${authToken}`)
        .send(tagData)
        .expect(201);

      expect(response.body.tag).toHaveProperty('color', '#ddd');
    });

    it('should not create tag with system tag name', async () => {
      const tagData = {
        name: systemTagName, // Tenta usar nome de tag do sistema
        color: '#FF0000'
      };

      const response = await request(app)
        .post('/tags')
        .set('Authorization', `Bearer ${authToken}`)
        .send(tagData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('tag do sistema com esse nome');
    });

    it('should not create duplicate personal tag', async () => {
      const tagData = {
        name: 'Tag Duplicada',
        color: '#FF0000'
      };

      // Cria a primeira vez
      await request(app)
        .post('/tags')
        .set('Authorization', `Bearer ${authToken}`)
        .send(tagData);

      // Tenta criar novamente
      const response = await request(app)
        .post('/tags')
        .set('Authorization', `Bearer ${authToken}`)
        .send(tagData)
        .expect(201);

      expect(response.body).toHaveProperty('msg', 'Tag já existe');
      expect(response.body).toHaveProperty('created', false);
    });

    it('should allow different users to have tags with same name', async () => {
      const tagData = {
        name: 'Tag Comum',
        color: '#FF0000'
      };

      // Primeiro usuário cria
      await request(app)
        .post('/tags')
        .set('Authorization', `Bearer ${authToken}`)
        .send(tagData)
        .expect(201);

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

      // Segundo usuário cria tag com mesmo nome
      const response = await request(app)
        .post('/tags')
        .set('Authorization', `Bearer ${otherLoginResponse.body.token}`)
        .send(tagData)
        .expect(201);

      expect(response.body.tag).toHaveProperty('name', 'Tag Comum');
    });

    it('should not create tag without required fields', async () => {
      const response = await request(app)
        .post('/tags')
        .set('Authorization', `Bearer ${authToken}`)
        .send({}) // Sem dados
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Erro de validação');
    });

    it('should not create tag with invalid color format', async () => {
      const tagData = {
        name: 'Tag com cor inválida',
        color: 'azul' // Formato inválido
      };

      const response = await request(app)
        .post('/tags')
        .set('Authorization', `Bearer ${authToken}`)
        .send(tagData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Erro de validação');
      expect(response.body.messages[0]).toContain('hexadecimal');
    });
  });
});
