# SensaShop

Plataforma de loja virtual com storefront, painel administrativo e importação de temas Shopify Liquid.

## Configuração local

Requisitos: Node.js 20 ou superior e npm.

```bash
npm install --legacy-peer-deps
cp .env.example .env.local
```

Preencha somente o arquivo `.env.local`. Para gerar um segredo forte de autenticação:

```bash
openssl rand -base64 32
```

Copie o resultado para `AUTH_SECRET` em `.env.local`. Nunca coloque esse valor no código ou em arquivos versionados.

Prepare os dados locais e inicie a aplicação:

```bash
npm run setup
npm run dev
```

A aplicação ficará disponível em [http://localhost:3000](http://localhost:3000).

## Variáveis de ambiente

Use [.env.example](./.env.example) como referência. Chaves com prefixo `NEXT_PUBLIC_` podem ser enviadas ao navegador; todas as outras devem permanecer somente no servidor.

Para produção, cadastre os valores diretamente no cofre de segredos da plataforma de hospedagem. Não envie `.env.local`, bancos SQLite, uploads de clientes ou temas comerciais ao GitHub.

## Verificações

```bash
npm run test:security
npm run typecheck
npm run lint
npm run build
```

## Conteúdo mantido apenas localmente

O `.gitignore` exclui deliberadamente:

- arquivos `.env` reais;
- bancos e estado local em `data/`;
- arquivos enviados para `public/uploads/`;
- configurações locais das ferramentas de desenvolvimento;
- o tema Shopify comercial usado como fixture de validação.

O arquivo `public/samples/shopify-dawn-sample.zip` é uma amostra mínima, sem credenciais, mantida para testes do importador.
