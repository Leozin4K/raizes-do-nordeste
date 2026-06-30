const express = require('express');
const prisma = require('../config/prisma');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

// Criar produto (apenas TOKEN ADMIN)
/**
 * @swagger
 * /produtos:
 *   post:
 *     summary: Cria um novo produto
 *     tags: [Produtos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               descricao:
 *                 type: string
 *               preco:
 *                 type: number
 *               estoque:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Produto criado com sucesso
 *       500:
 *         description: Erro ao criar produto
 */
router.post('/', authMiddleware, roleMiddleware('ADMIN'), async (req, res) => {
  console.log('Payload recebido:', req.body);
  const { nome, descricao, preco, estoque } = req.body;
  
  try {
    const produto = await prisma.produto.create({
      data: { nome, descricao, preco, estoque }
    });
    res.status(201).json(produto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar produto' }); //caso falte algum dos critérios
  }
});

/**
 * @swagger
 * /produtos:
 *   get:
 *     summary: Lista todos os produtos
 *     tags: [Produtos]
 *     responses:
 *       200:
 *         description: Lista de produtos
 *       500:
 *         description: Erro ao listar produtos
 */
// Listar todos os produtos (CLIENTE e ADMIN), necessário ao menos um token
router.get('/', authMiddleware, async (req, res) => {
  try {
    const produtos = await prisma.produto.findMany();
    res.json(produtos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao listar produtos' });
  }
});

/**
 * @swagger
 * /produtos/{id}:
 *   get:
 *     summary: Busca produto por ID
 *     tags: [Produtos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Produto encontrado
 *       404:
 *         description: Produto não encontrado
 *       500:
 *         description: Erro ao buscar produto
 */
// Buscar produto por ID, sendo os IDS criados por ordem crescente.
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const produto = await prisma.produto.findUnique({
      where: { id: Number(id) }
    });

    if (!produto) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json(produto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar produto' });
  }
});

/**
 * @swagger
 * /produtos/{id}:
 *   put:
 *     summary: Atualiza um produto por ID
 *     tags: [Produtos]
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
 *               nome:
 *                 type: string
 *               descricao:
 *                 type: string
 *               preco:
 *                 type: number
 *               estoque:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Produto atualizado com sucesso
 *       404:
 *         description: Produto não encontrado
 *       500:
 *         description: Erro ao atualizar produto
 */
// Atualizar produto por ID, podendo alterar preço, nome, descrição ou estoque, caso haja alteração secundária.
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, preco, estoque } = req.body;

    const produtoExistente = await prisma.produto.findUnique({
      where: { id: Number(id) }
    });

    if (!produtoExistente) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    const produtoAtualizado = await prisma.produto.update({
      where: { id: Number(id) },
      data: {
        nome: nome ?? produtoExistente.nome,
        descricao: descricao ?? produtoExistente.descricao,
        preco: preco ?? produtoExistente.preco,
        estoque: estoque ?? produtoExistente.estoque
      }
    });

    res.json(produtoAtualizado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
});

/**
 * @swagger
 * /produtos/{id}:
 *   delete:
 *     summary: Remove um produto por ID
 *     tags: [Produtos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Produto deletado com sucesso
 *       404:
 *         description: Produto não encontrado
 *       500:
 *         description: Erro ao deletar produto
 */

// Deletar produto por ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const produtoExistente = await prisma.produto.findUnique({
      where: { id: Number(id) }
    });

    if (!produtoExistente) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    await prisma.pedidoProduto.deleteMany({
      where: { produtoId: Number(id) }
    });

    await prisma.produto.delete({
      where: { id: Number(id) }
    });

    res.json({ message: 'Produto deletado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao deletar produto' });
  }
});

module.exports = router;
