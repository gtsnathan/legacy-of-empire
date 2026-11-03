# Legacy of Empire no Cloudflare (com online)

Este projeto publica o jogo e o servidor das salas online juntos, num único Worker do Cloudflare.

- `public/index.html`: o jogo.
- `src/worker.js`: o servidor das salas (um Durable Object por sala).
- `wrangler.jsonc`: a configuração do Cloudflare.

Funciona no plano gratuito do Cloudflare.

## Opção 1: pelo computador (mais rápido)

Precisa do Node.js instalado (nodejs.org, versão LTS).

1. Descompacte esta pasta e abra um terminal dentro dela.
2. Rode, um de cada vez:

```
npm install
npx wrangler login
npx wrangler deploy
```

3. O `wrangler login` abre o navegador para você entrar na sua conta do Cloudflare.
4. No fim do `deploy`, aparece o endereço do jogo, algo como `https://legacy-of-empire.SEU-NOME.workers.dev`.

## Opção 2: sem terminal, pelo GitHub

1. Crie um repositório no GitHub e envie todos os arquivos desta pasta.
2. No painel do Cloudflare, vá em **Workers & Pages**, toque em **Create** e escolha **Import a repository**.
3. Selecione o repositório e confirme o deploy. O Cloudflare lê o `wrangler.jsonc` sozinho.
4. Cada vez que você atualizar o repositório, o jogo é publicado de novo.

## Como jogar online

1. Abra o endereço do jogo no celular e escolha **Online**.
2. Toque em **Criar sala** e passe o código de 4 números para o seu amigo.
3. O amigo abre o mesmo endereço, escolhe **Online**, digita o código e toca em **Entrar**.

Quem cria a sala é o anfitrião: deixe o jogo aberto até o fim da partida. O amigo não precisa de conta em nada, só do link.

## Atualizar o jogo

Troque o `public/index.html` pela versão nova e rode `npx wrangler deploy` de novo (ou envie para o GitHub, na opção 2).
