const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Lanchonete',
      version: '1.0.0',
      description: 'Documentação das rotas de Auth, Produtos, Pedidos, Fidelidade e Pagamento'
    },
    tags: [
      { name: 'Auth', description: 'Rotas de autenticação (login e registro)' },
      { name: 'Produtos', description: 'CRUD de produtos' },
      { name: 'Pedidos', description: 'Gerenciamento de pedidos' },
      { name: 'Fidelidade', description: 'Sistema de pontos e resgates' },
      { name: 'Pagamento', description: 'Simulação de pagamentos' }
    ]
  },
  apis: ['./src/routes/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
