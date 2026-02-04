// Configurações globais para todos os testes
process.env.NODE_ENV = 'test';

// Aumenta o timeout para testes de integração
jest.setTimeout(10000);

// Mock do console para testes mais limpos (opcional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   error: jest.fn(),
// };
