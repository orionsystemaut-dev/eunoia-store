# Eunoia Store

Crie uma aplicação Web completa de E-Commerce moderna, responsiva (mobile-first) e com design clean. O sistema deve ser dividido em duas partes principais:

1. ÁREA PÚBLICA DO CLIENTE (E-Commerce):

- Header com logo, barra de busca, categorias, ícone de carrinho com contador e botão de login/conta.

- Home Page contendo:

  * Banner principal (Hero) promocional.

  * Carrossel/Grid de produtos em destaque e lançamentos.

  * Seção de categorias em cards.

  * Rodapé completo com links úteis e selos de segurança.

- Página de Catálogo com filtros (preço, categoria) e ordenação.

- Página de Detalhes do Produto com galeria de imagens, seletor de quantidade/variações, simulação de frete por CEP e botão "Adicionar ao Carrinho".

- Carrinho de Compras lateral (Drawer) e página de Checkout para finalização do pedido.

2. ÁREA DO GESTOR / PAINEL ADMIN (Acesso Restrito):

- Tela de Login exclusiva para o Administrador.

  * Validar com as credenciais fixas: 

    - LOGIN: ORION

    - SENHA: ORION2027

  * Exibir mensagem de erro para dados incorretos e botão de mostrar/ocultar senha.

- Dashboard Administrativo (acessível apenas após o login):

  * Cards de métricas rápidas: Total de Vendas, Número de Pedidos e Ticket Médio.

  * Módulo de Gestão de Produtos: Lista de produtos com opção de Adicionar, Editar e Excluir (com campos para nome, preço, estoque e imagem).

  * Módulo de Gestão de Pedidos: Lista de pedidos com status alterável (Aguardando Pagamento, Em Separação, Enviado, Entregue).

Garanta uma navegação fluida entre a loja e a área do gestor, utilizando componentes visuais modernos e estados simulados (mock values) funcionais.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/dee4235c-59a5-407e-ad24-f142337b91f0).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
