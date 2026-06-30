const prisma = require('../config/prisma');

// Criar produtos com nome preco e estoque
exports.create = async (req, res) => {
try {
const { nome, preco, estoque } = req.body;

```
const produto = await prisma.produto.create({
  data: { nome, preco, estoque }
});

res.status(201).json(produto);
```

} catch (error) {
res.status(500).json({ erro: error.message });
}
};

// Listar produtos, ação pode ser realizada por qualquer usuário logado.
exports.getAll = async (req, res) => {
try {
const produtos = await prisma.produto.findMany();
res.json(produtos);
} catch (error) {
res.status(500).json({ erro: error.message });
}
};

// Atualizar produto, apenas por admins com token
exports.update = async (req, res) => {
try {
const { id } = req.params;
const { nome, preco, estoque } = req.body;

```
const produto = await prisma.produto.update({
  where: { id },
  data: { nome, preco, estoque }
});

res.json(produto);
```

} catch (error) {
res.status(500).json({ erro: error.message });
}
};

// Deletar produto, apenas por admins
exports.remove = async (req, res) => {
try {
const { id } = req.params;

```
await prisma.produto.delete({
  where: { id }
});

res.status(204).send();
```

} catch (error) {
res.status(500).json({ erro: error.message });
}
};
