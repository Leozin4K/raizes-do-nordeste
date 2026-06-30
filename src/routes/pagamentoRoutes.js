const express = require('express');
const prisma = require('../config/prisma');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /pagamento/{pedidoId}:
 *   post:
 *     summary: Simula pagamento de um pedido
 *     tags: [Pagamento]
 *     parameters:
 *       - in: path
 *         name: pedidoId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pagamento aprovado ou recusado
 *       404:
 *         description: Pedido não encontrado
 *       500:
 *         description: Erro no pagamento mock
 */
router.post('/:pedidoId', authMiddleware, async (req, res) => {
  try {
    const { pedidoId } = req.params;

    const pedido = await prisma.pedido.findUnique({ where: { id: Number(pedidoId) } });
    if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado' });

    // Simulação, com 80% de aprovação e 20% de recusar
    const aprovado = Math.random() > 0.2;
    const novoStatus = aprovado ? 'PAGO' : 'CANCELADO';

    const atualizado = await prisma.pedido.update({
      where: { id: Number(pedidoId) },
      data: { status: novoStatus }
    });
    //Retorna mensagem de sucesso ou falha no pagamento MOCK
    res.json({
      message: aprovado ? 'Pagamento aprovado' : 'Pagamento recusado',
      pedido: atualizado
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro no pagamento mock' });
  }
});

module.exports = router;
