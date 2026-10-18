import * as path from "path";
import * as fs from "fs";
import { scanFile, scanDirectory } from "./scanner";
import { printHeader, printFindings, printSummary } from "./reporter";
import { isGitRepo, scanStagedFiles } from "./git";
import { installHook, uninstallHook } from "./hooks";

const args = process.argv.slice(2);

if (args.includes("--install-hook")) {
  installHook();
  process.exit(0);
}

if (args.includes("--uninstall-hook")) {
  uninstallHook();
  process.exit(0);
}

if (args.includes("--staged")) {
  if (!isGitRepo()) {
    console.error("Erro: não é um repositório git.");
    process.exit(1);
  }
  printHeader("staged changes (git)");
  const findings = scanStagedFiles();
  printFindings(findings);
  printSummary(findings);
}

const rawTarget = args[0];

if (!rawTarget) {
  console.error("Uso: npm run scan -- <arquivo-ou-diretório>");
  console.error("     npm run scan -- --staged");
  console.error("     npm run scan -- --install-hook");
  console.error("     npm run scan -- --uninstall-hook");
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
