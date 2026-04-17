# h5p2html CLI

CLI em Node.js para converter arquivos `.h5p` em um unico arquivo HTML (all-in-one), usando as libs oficiais da Lumi Education.

## O que este projeto faz

- Recebe um arquivo `.h5p` (ex.: Interactive Book).
- Importa o pacote e resolve as bibliotecas necessarias.
- Gera um HTML unico com CSS/JS/assets embutidos.
- Salva o arquivo final no caminho informado com `-o`.

## Requisitos

- Node.js 18+ (recomendado 20+)
- npm
- Pastas de runtime H5P presentes no projeto:
  - `h5p/core`
  - `h5p/editor`

## Estrutura essencial

```text
.
|- cli.js
|- config.json
|- package.json
|- package-lock.json
|- h5p/
|  |- core/
|  `- editor/
`- content/            (opcional, para guardar .h5p de exemplo)
```

Observacao: o CLI usa pasta temporaria do sistema para processamento e limpa no final. Nao mantem cache local de `libraries/content/tmp/user-data` no projeto.

## Instalacao

```bash
npm install
```

## Como usar

### Via Node

```bash
node cli.js "caminho/arquivo.h5p" -o "saida/arquivo.html" --lang pt
```

### Via Docker (conversao em lote)

1. Coloque os arquivos `.h5p` em `content/`.
2. Rode o build da imagem:

```bash
docker compose build
```

3. Rode a conversao:

```bash
docker compose run --rm h5p2html
```

4. Os `.html` gerados aparecerao em `out/`.

Esse fluxo converte automaticamente todos os arquivos `.h5p` encontrados em `content/`.

### Via Docker (arquivo unico)

Tambem e possivel converter um arquivo especifico sem depender do lote:

```bash
docker compose run --rm h5p2html /data/in/meu-livro.h5p -o /data/out/meu-livro.html --lang pt
```

### Como comando CLI (global local)

```bash
npm link
h5p2html "caminho/arquivo.h5p" -o "saida/arquivo.html" --lang pt
```

## Parametros

- `input` (obrigatorio): caminho do arquivo `.h5p`
- `-o`, `--out` (opcional): caminho do HTML de saida
- `--lang` (opcional): idioma do bundle (padrao: `pt`)

Se `-o` nao for informado, o nome de saida sera `<nome-do-arquivo>.html` na pasta atual.

No Docker (modo lote), os parametros sao controlados por variaveis no `docker-compose.yml`:

- `INPUT_DIR` (padrao: `/data/in`)
- `OUTPUT_DIR` (padrao: `/data/out`)
- `BUNDLE_LANG` (padrao: `pt`)

## Exemplo rapido (Windows PowerShell)

```powershell
node .\cli.js ".\content\customizable-interactive-book-249.h5p" -o ".\interactive-book-final.html" --lang pt
```

## Setup inicial do runtime H5P (se necessario)

Se voce clonar o projeto em outra maquina e nao tiver `h5p/core` e `h5p/editor`, rode:

```powershell
$CORE_VER = (Invoke-RestMethod https://api.github.com/repos/h5p/h5p-php-library/tags)[0].name
$EDITOR_VER = (Invoke-RestMethod https://api.github.com/repos/h5p/h5p-editor-php-library/tags)[0].name

New-Item -ItemType Directory -Force -Path .tmp-download/core, .tmp-download/editor | Out-Null

Invoke-WebRequest "https://github.com/h5p/h5p-php-library/archive/refs/tags/$CORE_VER.zip" -OutFile .tmp-download/core.zip
Expand-Archive .tmp-download/core.zip .tmp-download/core -Force
Copy-Item ".tmp-download/core/h5p-php-library-$CORE_VER/*" .\h5p\core -Recurse -Force

Invoke-WebRequest "https://github.com/h5p/h5p-editor-php-library/archive/refs/tags/$EDITOR_VER.zip" -OutFile .tmp-download/editor.zip
Expand-Archive .tmp-download/editor.zip .tmp-download/editor -Force
Copy-Item ".tmp-download/editor/h5p-editor-php-library-$EDITOR_VER/*" .\h5p\editor -Recurse -Force

Remove-Item .tmp-download -Recurse -Force
```

Se estiver usando Docker, esse setup manual nao e necessario: o `Dockerfile` baixa `h5p/core` e `h5p/editor` automaticamente durante o build da imagem.

## Solucao de problemas

- Erro de whitelist (`not-in-whitelist`): ajuste `contentWhitelist` em `config.json` para incluir extensoes usadas pelo pacote.
- Erro de pasta ausente: confira se `h5p/core` e `h5p/editor` existem.
- Pacotes muito grandes podem gerar HTML final grande (isso e esperado em all-in-one).

## Stack

- `@lumieducation/h5p-server`
- `@lumieducation/h5p-html-exporter`

## Licenca

ISC
