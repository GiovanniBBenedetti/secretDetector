# Secret Detector

A CLI tool written in TypeScript that scans source code for hardcoded secrets and credentials before they reach version control.

## What it detects

| Pattern | Severity |
|---|---|
| AWS Access Key ID / Secret Access Key | HIGH |
| GCP API Key / Service Account | HIGH |
| Azure Storage Key / Connection String | HIGH |
| JWT Token | MEDIUM |
| Bearer Token | MEDIUM |
| Generic API Key / Secret | MEDIUM |
| Hardcoded Password | LOW |

## Requirements

- Node.js 18+
- npm

## Installation

```bash
git clone https://github.com/GiovanniBBenedetti/secretDetector.git
cd secretDetector
npm install
```

## Usage

**Scan a file or directory**
```bash
npm run scan -- ./src
npm run scan -- ./src/index.ts
```

**Scan staged files (git)**
```bash
npm run scan:staged
```
Scans only the files currently staged for commit.

**Pre-commit hook**
```bash
# Install — runs automatically on every git commit
npm run hook:install

# Uninstall
npm run hook:uninstall
```
Once installed, the hook runs `scan:staged` before each commit and blocks it if any secret is found.

## Output example

```
[HIGH] AWS Access Key ID
  Line 12: const awsKeyId = "AKIA**********************"
  Description: AWS Access Key ID — permite acesso à conta AWS

--- SUMMARY ---
  Total : 3
  HIGH   : 1
  MEDIUM : 1
  LOW    : 1
```

Exits with code `1` if any secret is found, `0` if clean.

## Project structure

```
src/
  patterns.ts   # regex patterns and severity levels
  scanner.ts    # file and directory scanning logic
  git.ts        # staged files scanning via git show
  hooks.ts      # pre-commit hook installer
  reporter.ts   # terminal output formatting
  index.ts      # CLI entry point
```

## License

MIT
