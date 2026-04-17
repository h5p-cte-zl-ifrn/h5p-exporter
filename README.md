# h5p2html + WordPress (Docker, exportacao 1 por 1)

Projeto para converter arquivos `.h5p` em HTML all-in-one com imagem baseada em PHP, pensado para integracao com WordPress e armazenamento tecnico fora do docroot.

## Decisao de arquitetura

- Exportacao somente individual (um arquivo por vez).
- Entrada e saida por full path, sem depender de caminhos fixos do WordPress.
- Saida recomendada fora de `/var/www/html` para evitar acesso HTTP direto.

## O que foi preparado

- `Dockerfile` com base `php:8.2-cli-bookworm`.
- Instalacao automatica de Node.js 20 + dependencias npm.
- Download automatico de `h5p/core` e `h5p/editor` no build.
- Script PHP unico para exportacao individual: `bin/export-one.php`.
- Wrapper Node: `exporter/export-h5p.mjs` (chama `cli.js`).
- `docker-compose.yml` com `db`, `wordpress` e `h5p-exporter`.

## Estrutura principal

```text
.
|- cli.js
|- config.json
|- package.json
|- package-lock.json
|- Dockerfile
|- docker-compose.yml
|- exporter/
|  `- export-h5p.mjs
`- bin/
   `- export-one.php
```

## Como funciona

- Voce chama `php /app/bin/export-one.php <input.h5p> <output.html> [lang]`.
- O PHP valida input/output e cria o diretorio de saida se necessario.
- O PHP chama `node /app/exporter/export-h5p.mjs`.
- O `export-h5p.mjs` chama `cli.js`, que gera o HTML all-in-one.

## Variaveis de ambiente relevantes

- `NODE_EXPORTER_SCRIPT` (padrao: `/app/exporter/export-h5p.mjs`)
- `BUNDLE_LANG` (padrao: `pt`)
- `APP_DIR` (padrao no compose: `/app`)

## Passo a passo (Docker)

1. Inicie Docker Desktop.
2. Crie pastas tecnicas locais (exemplo):

```bash
mkdir -p data/h5p/exports
mkdir -p data/private/h5p-html
```

3. Coloque o `.h5p` em `data/h5p/exports`.
4. Suba banco e WordPress (se quiser stack completa):

```bash
docker compose up -d db wordpress
```

5. Build da imagem do exporter:

```bash
docker compose build h5p-exporter
```

6. Rode exportacao individual (full path de entrada e saida):

```bash
docker compose run --rm h5p-exporter \
  php /app/bin/export-one.php \
  /data/h5p/exports/meu-livro.h5p \
  /data/private/h5p-html/meu-livro.html \
  pt
```

## Importante sobre seguranca

- Para evitar download direto por URL, mantenha a saida fora de `/var/www/html`.
- Exemplo seguro: `/data/private/h5p-html/...`.
- O software autenticado (plugin/API) decide quando e como servir esse arquivo.

## Comandos uteis

- Validar compose:

```bash
docker compose config
```

- Ver logs WordPress:

```bash
docker compose logs -f wordpress
```

- Parar stack:

```bash
docker compose down
```

## Observacoes

- O conversor limpa diretorios temporarios ao fim de cada execucao.
- Se aparecer erro de whitelist, ajuste `contentWhitelist` em `config.json`.
