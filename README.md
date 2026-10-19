# Secret Detector

[![CI](https://github.com/GiovanniBBenedetti/secretDetector/actions/workflows/ci.yml/badge.svg)](https://github.com/GiovanniBBenedetti/secretDetector/actions/workflows/ci.yml)

Ferramenta de linha de comando escrita em TypeScript que escaneia o código-fonte em busca de segredos e credenciais expostos antes que cheguem ao controle de versão.

## O que detecta

| Padrão | Severidade |
|---|---|
| AWS Access Key ID / Secret Access Key | HIGH |
| GCP API Key / Service Account | HIGH |
| Azure Storage Key / Connection String | HIGH |
| JWT Token | MEDIUM |
| Bearer Token | MEDIUM |
| API Key / Secret genérico | MEDIUM |
| Senha hardcoded | LOW |

## Requisitos

- Node.js 18+
- npm

## Instalação

```bash
git clone https://github.com/GiovanniBBenedetti/secretDetector.git
cd secretDetector
npm install
```

## Como usar

**Escanear um arquivo ou diretório**
```bash
npm run scan -- ./src
npm run scan -- ./src/index.ts
```

**Filtrar por severidade mínima**
```bash
npm run scan -- ./src --severity HIGH
```
Reporta apenas ocorrências HIGH, ignorando MEDIUM e LOW.

**Ignorar caminhos**
```bash
npm run scan -- ./src --ignore test-samples/** *.test.ts
```

**Escanear arquivos em stage (git)**
```bash
npm run scan:staged
```
Escaneia apenas os arquivos que estão prontos para commit.

**Pre-commit hook**
```bash
# Instalar — executa automaticamente a cada git commit
npm run hook:install

# Remover
npm run hook:uninstall
```
Após instalado, o hook escaneia os arquivos em stage antes de cada commit e bloqueia caso encontre algum segredo.

**Gerar relatório JSON**
```bash
npm run scan -- ./src --output json --out-file report.json
```

**Gerar relatório HTML**
```bash
npm run scan -- ./src --output html --out-file report.html
```
Gera uma página HTML self-contained com summary de severidades e tabela de findings.

**Arquivo de configuração**

Crie um `.secretdetectorrc` na raiz do projeto para definir configurações padrão:
```json
{
  "severity": "HIGH",
  "ignore": ["test-samples/**", "*.test.ts"]
}
```

## Exemplo de saída

```
╔════════════════════════════════════════╗
║       SECRET DETECTOR  v4.0.0          ║
╚════════════════════════════════════════╝
  Target: ./src

[HIGH] AWS Access Key ID
  Linha 12: const awsKeyId = "AKIA**********************"
  Descrição: AWS Access Key ID — permite acesso à conta AWS

─── RESUMO ────────────────────────────────
  Total  : 3
  HIGH   : 1
  MEDIUM : 1
  LOW    : 1
```

Termina com código `1` se algum segredo for encontrado, `0` se estiver limpo.

## Estrutura do projeto

```
src/
  patterns.ts   # padrões regex e níveis de severidade
  scanner.ts    # lógica de escaneamento de arquivos e diretórios
  git.ts        # escaneamento de arquivos em stage via git show
  hooks.ts      # instalador do pre-commit hook
  config.ts     # carrega configurações do .secretdetectorrc
  exporters.ts  # exportadores JSON e HTML
  reporter.ts   # formatação da saída no terminal
  index.ts      # ponto de entrada da CLI
```

## Licença

MIT
