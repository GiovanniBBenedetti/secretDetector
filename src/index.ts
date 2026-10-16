import * as path from "path";
import * as fs from "fs";
import { scanFile, scanDirectory } from "./scanner";
import { printHeader, printFindings, printSummary } from "./reporter";

const rawTarget = process.argv[2];

if (!rawTarget) {
  console.error("Uso: npm run scan -- <arquivo-ou-diretório>");
  console.error("Exemplo: npm run scan -- ./src");
  process.exit(1);
}

const target = path.resolve(rawTarget);

if (!fs.existsSync(target)) {
  console.error(`Erro: caminho não encontrado → ${target}`);
  process.exit(1);
}

printHeader(target);

const stat = fs.statSync(target);

const findings = stat.isDirectory()
  ? scanDirectory(target)
  : scanFile(target);

printFindings(findings);
printSummary(findings);
