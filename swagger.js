const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ZettaLab To-Do API',
      version: '1.0.0',
      description: 'API de Gestão de Tarefas para o Desafio Técnico Back-end da ZettaLab',
      contact: {
        name: 'João Guilherme Ribeiro',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor Local',
      },
      {
        url: 'https://taskmanager-api-zettalab.onrender.com',
        description: 'Servidor de Produção',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  // Caminhos dos arquivos com anotações Swagger
  apis: ['./src/routes.js', './src/controllers/*.js'], 
};

const specs = swaggerJsdoc(options);
module.exports = specs;