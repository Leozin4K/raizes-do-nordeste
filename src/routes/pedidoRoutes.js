const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

/**
 * @swagger
 * /pedidos:
 *   post:
 *     summary: Cria um novo pedido
 *     tags: [Pedidos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               canalPedido:
 *                 type: string
 *                 enum: [APP, TOTEM, BALCAO, PICKUP, WEB]
 *               formaPagamento:
 *                 type: string
 *               itens:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     produtoId:
 *                       type: integer
 *                     quantidade:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso
 *       400:
 *         description: Pedido inválido
 *       404:
 *         description: Produto não encontrado
 *       409:
 *         description: Estoque insuficiente
 *       500:
 *         description: Erro ao criar pedido
 */
// Criar pedido (apenas como cliente)
router.post('/', authMiddleware, roleMiddleware('CLIENTE'), async (req, res) => {
  try {
    const { canalPedido, formaPagamento, itens } = req.body;
//Obriga informar canal de atendimento valido
    const validChannels = ["APP", "TOTEM", "BALCAO", "PICKUP", "WEB"];
    if (!validChannels.includes(canalPedido)) {
      return res.status(400).json({ error: "Canal de pedido inválido" });
    }
//Obriga informar pelo menos um item no pedido
    if (!itens || itens.length === 0) {
      return res.status(400).json({ error: "Pedido deve conter ao menos um item" });
    }

    for (const item of itens) {
      const produto = await prisma.produto.findUnique({ where: { id: item.produtoId } });
      if (!produto) {
        return res.status(404).json({ error: `Produto ${item.produtoId} não encontrado` });
      }
      //Caso o produto não tenha estoque, retorna erro
      if (produto.estoque < item.quantidade) {
        return res.status(409).json({ error: `Estoque insuficiente para produto ${produto.nome}` });
      }
    }
//mensagem de sucesso no pedido e informações do pedido criado
    const pedido = await prisma.pedido.create({
      data: {
        canalPedido,
        formaPagamento,
        status: 'AGUARDANDO_PAGAMENTO',
        usuarioId: req.user.id,
        itens: {
          create: itens.map(item => ({
            produtoId: item.produtoId,
            quantidade: item.quantidade
          }))
        }
      },
      include: { itens: true }
    });
//Dedução do estoque
    for (const item of itens) {
      await prisma.produto.update({
        where: { id: item.produtoId },
        data: { estoque: { decrement: item.quantidade } }
      });
    }

    res.status(201).json(pedido);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar pedido', detalhe: error.message });
  }
});

/**
 * @swagger
 * /pedidos/all:
 *   get:
 *     summary: Lista todos os pedidos (ADMIN)
 *     tags: [Pedidos]
 *     responses:
 *       200:
 *         description: Lista de pedidos
 *       500:
 *         description: Erro ao listar pedidos
 */
// Listar todos os pedidos, inclusive finalizados (necessário token ADMIN)
router.get('/all', authMiddleware, roleMiddleware('ADMIN'), async (req, res) => {
  try {
    const pedidos = await prisma.pedido.findMany({
      include: { itens: true, usuario: true }
    });
    res.json(pedidos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao listar todos os pedidos' });
  }
});

/**
 * @swagger
 * /pedidos:
 *   get:
 *     summary: Lista pedidos do usuário logado (CLIENTE)
 *     tags: [Pedidos]
 *     responses:
 *       200:
 *         description: Lista de pedidos do cliente
 *       500:
 *         description: Erro ao listar pedidos
 */
// Listar pedidos do usuário logado (necessário token do CLIENTE), caso queira consultar pedido de outro usuário, retorna permissão insuficiente
router.get('/', authMiddleware, roleMiddleware('CLIENTE'), async (req, res) => {
  try {
    const pedidos = await prisma.pedido.findMany({
      where: { usuarioId: req.user.id },
      include: { itens: true }
    });
    res.json(pedidos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao listar pedidos' });
  }
});

/**
 * @swagger
 * /pedidos/{id}/status:
 *   put:
 *     summary: Atualiza status de um pedido (ADMIN)
 *     tags: [Pedidos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: ENTREGUE
 *     responses:
 *       200:
 *         description: Status atualizado com sucesso
 *       500:
 *         description: Erro ao atualizar status
 */
// Atualizar status do pedido para Entregue, após sucesso em pagamento MOCK
router.put('/:id/status', authMiddleware, roleMiddleware('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const pedido = await prisma.pedido.update({
      where: { id: Number(id) },
      data: { status },
      include: { itens: true }
    });

    //Marcação de entregue e dedução de pontos de fidelidade, caso o cliente tenha consentido
    if (status === 'ENTREGUE') {
      const pontos = pedido.itens.reduce((acc, item) => acc + item.quantidade, 0);
      const usuario = await prisma.usuario.findUnique({ where: { id: pedido.usuarioId } });
      if (usuario && usuario.consentimentoFidelidade) {
        await prisma.fidelidade.create({
          data: {
            usuarioId: pedido.usuarioId,
            pontos,
            tipo: 'ACUMULO'
          }
        });
      }
    }

    res.json(pedido);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
});

module.exports = router;
