API desenvolvida para gestão de pedidos, produtos, unidades, fidelidade e autenticação com roles (CLIENTE/ADMIN).

Tecnologias
Node.js
Express
Prisma ORM
PostgreSQL
Swagger para documentação

---------------
Instalação e execução
Instalar dependências: npm install
Rodar migrations do Prisma: npx prisma migrate dev
Abrir Prisma Studio para visualizar dados: npx prisma studio
Iniciar servidor: npm run dev

Caso prefira, pode resetar o banco de dados para apagar dados anteriores, ao rodar 
"npx prisma migrate reset" no terminal.

-----------------
Autenticação
POST /auth/register → Criar usuário (CLIENTE ou ADMIN)
POST /auth/login → Login e geração de token JWT
----------------

Roles disponíveis:
CLIENTE → pode criar pedidos e consultar fidelidade
ADMIN → pode gerenciar produtos, unidades e pedidos
---------

Unidades
POST /unidades → Criar unidade (ADMIN)
GET /unidades → Listar unidades
GET /unidades/:id → Detalhar unidade
GET /unidades/:id/cardapio → Listar produtos da unidade

============

Produtos
POST /produtos → Criar produto (ADMIN)
GET /produtos → Listar produtos
PATCH /produtos/:id → Atualizar produto
DELETE /produtos/:id → Remover produto

=========
Pedidos
POST /pedidos → Criar pedido (CLIENTE)
GET /pedidos → Listar pedidos (ADMIN vê todos, CLIENTE vê os próprios)
GET /pedidos/:id → Detalhar pedido
PATCH /pedidos/:id/status → Atualizar status (ADMIN)

==========

Status possíveis:
AGUARDANDO_PAGAMENTO
PAGO
CANCELADO
ENTREGUE

===========

Fidelidade
GET /fidelidade → Consultar pontos do cliente
POST /fidelidade/resgatar → Resgatar pontos
Tipos de fidelidade:
ACUMULO
RESGATE

=============
Relatórios (ADMIN)
Vendas por unidade
Produtos mais vendidos
Pontos acumulados e resgatados

=================
Instalar código e pendências, e dar npm run dev para ter acesso ao POSTMAN com testes prontos
POSTMAN PARA TESTES
https://www.postman.com/leonardoizidoro20-9483944/backend/collection/tkdauq8/api-lanchonete
ou
[API Lanchonete.postman_collection.json](https://github.com/user-attachments/files/29487113/API.Lanchonete.postman_collection.json)




Documentação Swagger
Disponível em: http://localhost:3000/api-docs
