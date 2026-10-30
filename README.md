# Motor de Obras — M&M Remodelações

Ferramenta interna: transforma fotos + um brief de uma obra em **página SEO** +
**posts para Instagram, LinkedIn e Google Business**, em PT-PT. O conteúdo é
gerado por IA (OpenRouter) e revisto por uma pessoa antes de publicar.

## Arrancar (local)

```bash
cp .env.example .env
# cola a OPENROUTER_API_KEY
npm run demo
```

Abre **http://localhost:4321**. O demo gera duas obras com as fotos em `demo/` e
usa a IA real; se a chave falhar, usa os textos de exemplo para não bloquear a
demonstração.

## Deploy na VPS (Docker Compose)

Precisas de Docker e Compose. O serviço `web` guarda obras, fotos e uploads do
Telegram no volume `obras`; o bot é um segundo serviço opcional.

```bash
cp .env.example .env
# edita: OPENROUTER_API_KEY, PUBLIC_URL (ex.: https://obras.exemplo.pt),
# DASHBOARD_AUTH=utilizador:password e, se usares bot, TELEGRAM_BOT_TOKEN

docker compose up -d --build
docker compose --profile bot up -d --build   # inclui o bot (exige TELEGRAM_BOT_TOKEN)
```

O painel fica em `http://IP_DA_VPS:4321`, ou em `PUBLIC_URL` se tiveres um proxy.
`/health` responde sem autenticação; tudo o resto exige `DASHBOARD_AUTH`. Com
`HOST=0.0.0.0` (Docker) e sem `DASHBOARD_AUTH`, o painel recusa todos os pedidos.

Para semear as obras de demonstração dentro do volume:

```bash
docker compose exec web node scripts/demo.js
```

Comandos úteis:

```bash
docker compose logs -f web
docker compose exec web node scripts/check.js    # testes
docker compose up -d --build                     # atualizar após git pull
docker compose down                              # mantém o volume
docker run --rm -v mkt-guy_obras:/data -v "$PWD":/backup alpine \
  tar czf /backup/obras.tgz -C /data .           # backup do volume
```

### HTTPS e proxy

Não deixes o painel em HTTP aberto: passam fotos de clientes. Põe o `web` atrás
do Traefik/Dokploy que já usas (ou Caddy/Nginx) e aponta `PUBLIC_URL` para o
domínio HTTPS. No Dokploy, cria a app com este `docker-compose.yml`, define as
variáveis no painel e deixa o proxy tratar do domínio.

### Publicar no site a partir do container

O `publish` copia a obra para o repositório do site, que não é montado por
omissão. No VPS, acrescenta ao serviço `web`:

```yaml
    volumes:
      - obras:/app/data
      - /caminho/para/mm-remodelacoes:/site
    environment:
      SITE_REPO: /site
```

Depois confirma o consentimento e publica com
`docker compose exec web npm run publish -- <slug> --consent`, seguido do
build/deploy do site.

## O que tens no painel

- **`/`** — lista de obras, estado e acesso ao preview.
- **`/preview/<slug>/`** — página num iframe + brief editável + os 3 posts com
  botão de copiar + **seletor do selo Leroy Merlin** + confirmação de
  consentimento + publicar.
- **`/obra/<slug>/`** — a página como vai ficar no site.
- **`/obras/`** — o portfólio.

## Publicar no site

O `SITE_REPO` aponta para o repositório do site. Publicar copia a página para
`public/obras/<slug>/`, copia a logo para `public/assets/leroy-merlin.svg`,
atualiza o `sitemap.xml` e gera o hub `/obras/`.

```bash
npm run publish -- remodelacao-quarto-braga --consent
```

Depois faz build/deploy do site (`npm run build` em `mm-remodelacoes`). O
`--consent` confirma que tens autorização do cliente para publicar as fotos. No
painel, a mesma confirmação é uma checkbox.

## Bot do Telegram

1. Fala com `@BotFather`, cria um bot e copia o token para `TELEGRAM_BOT_TOKEN`.
2. Corre `npm run bot`.
3. Envia `/start` ao bot: ele responde com o teu **chat ID**.
4. Mete esse ID em `ALLOWED_CHAT_IDS` (separados por vírgula) e reinicia.

Fluxo: `/nova` → fotos → áudio ou texto com os factos → `/gerar` → abre o
preview → `/publicar` → `/sim` (consentimento).

O bot usa long polling: não precisa de domínio nem webhook. Em Docker, define
`PUBLIC_URL` com o endereço público do painel para os links abrirem no telemóvel.

## Configuração

| Variável | Para quê |
|---|---|
| `OPENROUTER_API_KEY` | IA (texto + visão + transcrição) |
| `OPENROUTER_MODEL` | modelo de texto/visão (default `google/gemini-2.5-flash`) |
| `OPENROUTER_ASR_MODEL` | transcrição (default `openai/whisper-large-v3`) |
| `SITE_URL` | domínio usado nos canonicals e links |
| `SITE_REPO` | caminho local do repositório do site |
| `WHATSAPP` | número do CTA (só dígitos) |
| `PREVIEW_PORT` / `HOST` | servidor de preview (o Docker força `4321` / `0.0.0.0`) |
| `PUBLIC_URL` | URL pública do painel, usada nos links do bot |
| `DASHBOARD_AUTH` | `utilizador:password` do painel; obrigatório fora de localhost |
| `TELEGRAM_BOT_TOKEN` | token do bot |
| `ALLOWED_CHAT_IDS` | lista de chats autorizados |

## Estrutura

```
src/ai.js          OpenRouter: visão, transcrição, geração
src/render.js      HTML da página, hub, painel e dashboard
src/store.js       obras em data/, sitemap, publicação
src/server.js      preview local + API de regenerar/publicar
src/telegram.js    bot (long polling)
scripts/demo.js    gera as 2 obras de demonstração
scripts/publish.js publica uma obra no site
```

Os dados ficam em `data/obras/<slug>/` (`content.json`, `index.html`, fotos).
Não há base de dados, CMS nem build. O custo de IA por obra é de cêntimos.

## Limites conhecidos

- **Publicação social é manual.** As APIs do Instagram/LinkedIn exigem app review;
  o painel entrega o texto pronto a colar. Auto-post é fase 2.
- **Consentimento é obrigatório.** O bot e o painel bloqueiam a publicação sem
  confirmação; não publiques moradas nem rostos.
- **Selo Leroy Merlin:** aparece só quando selects “Mostrar na página” no
  preview. A logo é usada ao abrigo da parceria de instalador oficial; confirma
  as regras de marca da Leroy Merlin antes de campanhas pagas.
- **A home do site é SPA.** As páginas de obra são estáticas e indexáveis; a home
  depende de render JS. Pré-renderizar só se o orgânico justificar.
- **O hub `/obras/` ainda não está no menu do site.** Adicionar o link depois da
  primeira publicação.
- **Demo:** os briefs e a localização (Braga) são exemplos. Substitui pelos dados
  reais antes de publicar.
- **Imagens:** são servidas no tamanho original. As fotos do Telegram já vêm
  comprimidas; para fotos de máquina, otimizar antes de publicar.

## Licença

MIT — vê [LICENSE](LICENSE).
