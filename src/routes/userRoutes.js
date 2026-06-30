const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { prisma } = require('../prisma'); // ajuste conforme sua estrutura

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Operações relacionadas a usuários
 */

/**
 * @swagger
 * /users/perfil:
 *   get:
 *     summary: Retorna o perfil do usuário autenticado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil do usuário autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                 user:
 *                   type: object
 */
router.get('/perfil', authMiddleware, (req, res) => {
  res.json({ mensagem: "Acesso autorizado", user: req.user });
});

/**
 * @swagger
 * /users/{id}/consentimento:
 *   patch:
 *     summary: Atualiza consentimento de fidelidade do usuário
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               consentimentoFidelidade:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Consentimento atualizado
 */
//Atualiza o consentimento de fidelidade
router.patch('/:id/consentimento', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { consentimentoFidelidade } = req.body;

  const usuario = await prisma.usuario.update({
    where: { id: Number(id) },
    data: { consentimentoFidelidade }
  });

  res.json(usuario);
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Retorna lista de usuários
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Lista de usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get('/users', (req, res) => {
  res.json([{ id: 1, name: 'Leonardo' }]);
});

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *       example:
 *         id: 1
 *         name: Leonardo
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Cria um novo usuário
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
*/

// Usuário criado com sucesso.
router.post('/users', async (req, res) => {
  const { name, email } = req.body;

  try {
    const novoUsuario = await prisma.usuario.create({
      data: { name, email }
    });
    res.status(201).json(novoUsuario);
  } catch (error) {
    res.status(400).json({ error: "Erro ao criar usuário" });
  }
});
