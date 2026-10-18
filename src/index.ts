import * as path from "path";
import * as fs from "fs";
import { Command } from "commander";
import { scanFile, scanDirectory, Finding } from "./scanner";
import { printHeader, printFindings, printSummary } from "./reporter";
import { isGitRepo, scanStagedFiles } from "./git";
import { installHook, uninstallHook } from "./hooks";
import { loadConfig } from "./config";

type SeverityLevel = "HIGH" | "MEDIUM" | "LOW";

const SEVERITY_ORDER: Record<SeverityLevel, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };

function filterBySeverity(findings: Finding[], min: SeverityLevel): Finding[] {
  return findings.filter(f => SEVERITY_ORDER[f.pattern.severity] >= SEVERITY_ORDER[min]);
}

const program = new Command();

program
  .name("secret-detector")
  .description("Scans source code for hardcoded secrets and credentials")
  .version("3.0.0");

program
  .command("scan")
  .description("Scan a file or directory for secrets")
  .argument("[target]", "file or directory to scan (default: current directory)")
  .option("--staged", "scan only staged git files")
  .option("-s, --severity <level>", "minimum severity to report: HIGH | MEDIUM | LOW", "LOW")
  .option("-i, --ignore <patterns...>", "patterns to ignore (e.g. test-samples/** *.test.ts)")
  .action((target: string | undefined, options: { staged: boolean; severity: string; ignore?: string[] }) => {
    const config = loadConfig();

    const severity = (options.severity.toUpperCase() as SeverityLevel) ?? config.severity;
    const ignorePatterns = [...config.ignore, ...(options.ignore ?? [])];

    if (options.staged) {
      if (!isGitRepo()) {
        console.error("Erro: não é um repositório git.");
        process.exit(1);
      }
      printHeader("staged changes (git)");
      const findings = filterBySeverity(scanStagedFiles(ignorePatterns), severity);
      printFindings(findings);
      printSummary(findings);
      return;
    }

    const scanTarget = target ? path.resolve(target) : process.cwd();

    if (!fs.existsSync(scanTarget)) {
      console.error(`Erro: caminho não encontrado → ${scanTarget}`);
      process.exit(1);
    }

    printHeader(scanTarget);

    const stat = fs.statSync(scanTarget);
    const raw = stat.isDirectory()
      ? scanDirectory(scanTarget, ignorePatterns)
      : scanFile(scanTarget);

    const findings = filterBySeverity(raw, severity);
    printFindings(findings);
    printSummary(findings);
  });

program
  .command("hook")
  .description("Manage the pre-commit hook")
  .argument("<action>", "install or uninstall")
  .action((action: string) => {
    if (action === "install") {
      installHook();
    } else if (action === "uninstall") {
      uninstallHook();
    } else {
      console.error(`Ação inválida: "${action}". Use install ou uninstall.`);
      process.exit(1);
    }
  });

program.parse();
