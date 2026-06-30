const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());

// Importar rotas
const authRoutes = require('./routes/authRoutes');
const produtosRoutes = require('./routes/produtosRoutes');
const pedidoRoutes = require('./routes/pedidoRoutes');
const fidelidadeRoutes = require('./routes/fidelidadeRoutes');
const pagamentoRoutes = require('./routes/pagamentoRoutes');
const { swaggerUi, specs } = require('./swagger');
const unidadesRoutes = require('./routes/unidadesRoutes');



// Rotas registradas
app.use('/auth', authRoutes);
app.use('/produtos', produtosRoutes);
app.use('/pedidos', pedidoRoutes);
app.use('/fidelidade', fidelidadeRoutes);
app.use('/pagamentos', pagamentoRoutes);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/unidades', unidadesRoutes);

// Rota para testes
app.get('/', (req, res) => {
  res.send('API funcionando');
});

// Iniciar servidor e devolver Porta
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});