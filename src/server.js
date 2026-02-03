const app = require('./app'); // Importa a configuração do app (que inclui Swagger + rotas)
const { connection } = require('./database');
const seedSystemTags = require('./database/seedSystemTags');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Testa a conexão que vem do arquivo database/index.js
    await connection.authenticate();
    console.log('✅ Conexão com o banco estabelecida!');

    await connection.sync({ force: false });
    console.log('📦 Tabelas sincronizadas.');

    // Inicializa tags do sistema (apenas se não existirem)
    await seedSystemTags();

    app.listen(PORT, () => {
      console.log(`📡 Servidor rodando na porta ${PORT}`);
      console.log(`📚 Documentação disponível em http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar:', error);
  }
}

startServer();