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
      // Depois adicionaremos o servidor de produção aqui
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
  // Onde o Swagger vai procurar os comentários da documentação?
  apis: ['./src/routes.js', './src/controllers/*.js'], 
};

const specs = swaggerJsdoc(options);
module.exports = specs;