# Secret Detector

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

## Exemplo de saída

```
[HIGH] AWS Access Key ID
  Linha 12: const awsKeyId = "AKIA**********************"
  Descrição: AWS Access Key ID — permite acesso à conta AWS

--- RESUMO ---
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
  reporter.ts   # formatação da saída no terminal
  index.ts      # ponto de entrada da CLI
```

## Licença

MIT
