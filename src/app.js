const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const swaggerUi = require('swagger-ui-express'); // Importa o visualizador
const swaggerSpecs = require('../swagger');      // Importa a configuração
require('./database');

const app = express();

app.use(cors());
app.use(express.json());

// --- [PASSO 1] DOCUMENTAÇÃO (Vem primeiro!) ---
// Como está antes das rotas, o sistema carrega isso livremente.
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// --- [PASSO 2] ROTAS DA APLICAÇÃO ---
// Aqui dentro está o 'authMiddleware'. Como ele está DEPOIS,
// ele não bloqueia o Swagger acima.
app.use(routes);

module.exports = app;