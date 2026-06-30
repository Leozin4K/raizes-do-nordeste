const prisma = require('../config/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {// Senha do usuário é criptografada
    const { nome, email, senha } = req.body;

    const hash = await bcrypt.hash(senha, 10);

    const user = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: hash // Armazenada a senha criptografada
      }
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    const user = await prisma.usuario.findUnique({
      where: { email }
    });
//Caso o email ou senha estejam incorretos, retorna erro
    if (!user) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    const valid = await bcrypt.compare(senha, user.senha);
//Se senha errada, retorna erro
    if (!valid) {
      return res.status(401).json({ erro: "Senha inválida" });
    }
// Geração de Token JWT
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};
