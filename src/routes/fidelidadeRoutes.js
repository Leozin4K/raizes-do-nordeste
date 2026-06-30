const express = require('express');
const prisma = require('../config/prisma');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

/**
 * @swagger
 * /fidelidade/saldo:
 *   get:
 *     summary: Consulta saldo de pontos do cliente logado
 *     tags: [Fidelidade]
 *     responses:
 *       200:
 *         description: Saldo retornado com sucesso
 *       500:
 *         description: Erro ao consultar saldo
 */
// Consultar saldo (do cliente com o TOKEN)
router.get('/saldo', authMiddleware, roleMiddleware('CLIENTE'), async (req, res) => {
  try {
    const registros = await prisma.fidelidade.findMany({
      where: { usuarioId: req.user.id }
    });

    const saldo = registros.reduce((acc, r) => {
      return r.tipo === 'ACUMULO' ? acc + r.pontos : acc - r.pontos;
    }, 0);

    res.json({ usuarioId: req.user.id, saldo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao consultar saldo' });
  }
});

/**
 * @swagger
 * /fidelidade/usuario/{usuarioId}:
 *   get:
 *     summary: Consulta saldo de pontos de um usuário (ADMIN)
 *     tags: [Fidelidade]
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Saldo retornado com sucesso
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro ao consultar saldo
 */
// Consultar saldo de qualquer usuário (função exclusiva do ADMIN)
router.get('/usuario/:usuarioId', authMiddleware, roleMiddleware('ADMIN'), async (req, res) => {
  try {
    const { usuarioId } = req.params;

    const usuario = await prisma.usuario.findUnique({ where: { id: Number(usuarioId) } });
    if (!usuario) {
      return res.status(404).json({ error: `Usuário ${usuarioId} não encontrado` });
    }
// Consulta os registros do usuário com seu ID
    const registros = await prisma.fidelidade.findMany({
      where: { usuarioId: Number(usuarioId) }
    });
// Deduz os pontos do seu saldo 
    const saldo = registros.reduce((acc, r) => {
      return r.tipo === 'ACUMULO' ? acc + r.pontos : acc - r.pontos;
    }, 0);
// Em casos de usuários inválidos ou ID incorretos
    res.json({ usuarioId: Number(usuarioId), saldo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao consultar saldo' });
  }
});

/**
 * @swagger
 * /fidelidade/resgatar:
 *   post:
 *     summary: Resgata pontos de fidelidade do cliente logado
 *     tags: [Fidelidade]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pontos:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Resgate realizado com sucesso
 *       400:
 *         description: Saldo insuficiente ou pontos inválidos
 *       500:
 *         description: Erro ao resgatar pontos
 */
// Resgatar pontos
router.post('/resgatar', authMiddleware, roleMiddleware('CLIENTE'), async (req, res) => {
  try {
    const { pontos } = req.body;

    if (!pontos || pontos <= 0) {
      return res.status(400).json({ error: 'Quantidade de pontos inválida' });
    }

    const registros = await prisma.fidelidade.findMany({ where: { usuarioId: req.user.id } });
    const saldo = registros.reduce((acc, r) => {
      return r.tipo === 'ACUMULO' ? acc + r.pontos : acc - r.pontos;
    }, 0);

    if (saldo < pontos) {
      return res.status(400).json({ error: 'Saldo insuficiente' });
    }

    await prisma.fidelidade.create({
      data: { usuarioId: req.user.id, pontos, tipo: 'RESGATE' }
    });

    res.json({ message: 'Resgate realizado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao resgatar pontos' });
  }
});

/**
 * @swagger
 * /fidelidade/historico:
 *   get:
 *     summary: Consulta histórico de fidelidade do cliente logado
 *     tags: [Fidelidade]
 *     responses:
 *       200:
 *         description: Histórico retornado com sucesso
 *       500:
 *         description: Erro ao consultar histórico
 */
// Histórico de pontos de fidelidade resgatados e/ou acumulados pelo cliente (necessário TOKEN)
router.get('/historico', authMiddleware, roleMiddleware('CLIENTE'), async (req, res) => {
  try {
    const registros = await prisma.fidelidade.findMany({
      where: { usuarioId: req.user.id },
      orderBy: { id: 'desc' }
    });

    res.json(registros);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao consultar histórico' });
  }
});

/**
 * @swagger
 * /fidelidade/usuario/{usuarioId}/historico:
 *   get:
 *     summary: Consulta histórico de fidelidade de um usuário (ADMIN)
 *     tags: [Fidelidade]
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Histórico retornado com sucesso
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro ao consultar histórico
 */
// Consultar histórico de fidelidade de qualquer usuário (necessário TOKEN deADMIN)
router.get('/usuario/:usuarioId/historico', authMiddleware, roleMiddleware('ADMIN'), async (req, res) => {
  try {
    const { usuarioId } = req.params;

    const usuario = await prisma.usuario.findUnique({ where: { id: Number(usuarioId) } });
    if (!usuario) {
      return res.status(404).json({ error: `Usuário ${usuarioId} não encontrado` });
    }

    const registros = await prisma.fidelidade.findMany({
      where: { usuarioId: Number(usuarioId) },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      usuarioId: Number(usuarioId),
      historico: registros
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao consultar histórico de fidelidade' });
  }
});

module.exports = router;
