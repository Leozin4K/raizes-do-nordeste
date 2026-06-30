const express = require('express');
const prisma = require('../config/prisma');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

/**
 * @swagger
 * /unidades:
 *   post:
 *     summary: Cria uma nova unidade
 *     tags: [Unidades]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               endereco:
 *                 type: string
 *     responses:
 *       201:
 *         description: Unidade criada com sucesso
 */

//Criação de unidade, além da matriz inicialmente criada.
router.post('/', authMiddleware, roleMiddleware('ADMIN'), async (req, res) => {
  try {
    const { nome, endereco } = req.body;
    const unidade = await prisma.unidade.create({ data: { nome, endereco } });
    res.status(201).json(unidade);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar unidade' });
  }
});

/**
 * @swagger
 * /unidades:
 *   get:
 *     summary: Lista todas as unidades
 *     tags: [Unidades]
 *     responses:
 *       200:
 *         description: Lista de unidades
 */

//Lista as unidades existentes
router.get('/', authMiddleware, async (req, res) => {
  try {
    const unidades = await prisma.unidade.findMany();
    res.json(unidades);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar unidades' });
  }
});

/**
 * @swagger
 * /unidades/{id}:
 *   get:
 *     summary: Consulta uma unidade por ID
 *     tags: [Unidades]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Unidade encontrada
 *       404:
 *         description: Unidade não encontrada
 */

//Caso queira consultar uma unidade específica, pode ser consultada pelo ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const unidade = await prisma.unidade.findUnique({
      where: { id: Number(req.params.id) },
      include: { produtos: true, pedidos: true }
    });
    if (!unidade) return res.status(404).json({ error: 'Unidade não encontrada' });
    res.json(unidade);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao consultar unidade' });
  }
});
/**
 * @swagger
 * /unidades/{id}/cardapio:
 *   get:
 *     summary: Lista o cardápio de uma unidade
 *     tags: [Unidades]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de produtos da unidade
 *       404:
 *         description: Unidade não encontrada
 */
router.get('/:id/cardapio', authMiddleware, async (req, res) => {
  try {
    const unidadeId = Number(req.params.id);

    // Verifica se a unidade existe
    const unidade = await prisma.unidade.findUnique({
      where: { id: unidadeId }
    });
    if (!unidade) {
      return res.status(404).json({ error: 'Unidade não encontrada' });
    }

    // Busca os produtos cadastrados ou se só existem naquela unidade. (Cárdapio)
    const produtos = await prisma.produto.findMany({
      where: { unidadeId }
    });

    res.json(produtos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao consultar cardápio da unidade' });
  }
});


module.exports = router;
