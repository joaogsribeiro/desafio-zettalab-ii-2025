const { User, Task, Tag } = require('./testDb');
const bcrypt = require('bcryptjs');

// Factory para criar usuários de teste
const createUser = async (overrides = {}) => {
  const defaultData = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password_hash: 'password123'
  };

  const userData = { ...defaultData, ...overrides };
  return await User.create(userData);
};

// Factory para criar tarefas de teste
const createTask = async (userId, overrides = {}) => {
  const defaultData = {
    title: 'Test Task',
    description: 'Test description',
    status: 'PENDING',
    user_id: userId
  };

  const taskData = { ...defaultData, ...overrides };
  return await Task.create(taskData);
};

// Factory para criar tags de teste
const createTag = async (userId, overrides = {}) => {
  const defaultData = {
    name: `Tag${Date.now()}`,
    color: '#999999',
    user_id: userId
  };

  const tagData = { ...defaultData, ...overrides };
  return await Tag.create(tagData);
};

module.exports = {
  createUser,
  createTask,
  createTag
};
