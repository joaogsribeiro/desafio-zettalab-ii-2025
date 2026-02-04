const { setupTestDB, cleanupTestDB, closeTestDB } = require('../helpers/testDb');
const { createUser } = require('../helpers/factories');

describe('Test Configuration', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await cleanupTestDB();
    await closeTestDB();
  });

  it('should setup test database correctly', async () => {
    expect(true).toBe(true);
  });

  it('should create a user using factory', async () => {
    const user = await createUser({ name: 'John Doe', email: 'john@test.com' });
    
    expect(user).toBeDefined();
    expect(user.id).toBeDefined();
    expect(user.name).toBe('John Doe');
    expect(user.email).toBe('john@test.com');
  });

  it('should hash password automatically', async () => {
    const user = await createUser({ password_hash: 'plainpassword' });
    
    expect(user.password_hash).not.toBe('plainpassword');
    expect(user.password_hash.length).toBeGreaterThan(20);
  });
});
