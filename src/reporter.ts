import { Finding } from "./scanner";

const RESET  = "\x1b[0m";
const BOLD   = "\x1b[1m";
const RED    = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN   = "\x1b[36m";
const GREEN  = "\x1b[32m";
const GRAY   = "\x1b[90m";

function severityColor(severity: "HIGH" | "MEDIUM" | "LOW"): string {
  switch (severity) {
    case "HIGH":   return RED;
    case "MEDIUM": return YELLOW;
    case "LOW":    return CYAN;
  }
}

function maskSecret(value: string): string {
  if (value.length <= 4) return "****";
  return value.slice(0, 4) + "*".repeat(Math.min(value.length - 4, 20));
}

export function printHeader(targetPath: string): void {
  console.log(`\n${BOLD}╔════════════════════════════════════════╗${RESET}`);
  console.log(`${BOLD}║       SECRET DETECTOR  v4.0.0          ║${RESET}`);
  console.log(`${BOLD}╚════════════════════════════════════════╝${RESET}`);
  console.log(`${GRAY}  Target: ${CYAN}${targetPath}${RESET}\n`);
}

export function printFindings(findings: Finding[]): void {
  if (findings.length === 0) {
    console.log(`${GREEN}${BOLD}✔ Nenhum segredo encontrado!${RESET}\n`);
    return;
  }

  const byFile = new Map<string, Finding[]>();
  for (const finding of findings) {
    const existing = byFile.get(finding.filePath) ?? [];
    existing.push(finding);
    byFile.set(finding.filePath, existing);
  }

  for (const [filePath, fileFindings] of byFile) {
    console.log(`${BOLD}📄 ${filePath}${RESET}`);

    for (const f of fileFindings) {
      const color = severityColor(f.pattern.severity);
      const badge = `${color}${BOLD}[${f.pattern.severity}]${RESET}`;
      const name  = `${BOLD}${f.pattern.name}${RESET}`;

      console.log(`  ${badge} ${name}`);
      console.log(`  ${GRAY}Linha ${f.lineNumber}:${RESET} ${f.lineContent}`);
      console.log(`  ${GRAY}Encontrado:${RESET} ${color}${maskSecret(f.match)}${RESET}`);
      console.log(`  ${GRAY}Descrição:${RESET} ${f.pattern.description}`);
      console.log();
    }
  }
}

export function printSummary(findings: Finding[]): void {
  const high   = findings.filter(f => f.pattern.severity === "HIGH").length;
  const medium = findings.filter(f => f.pattern.severity === "MEDIUM").length;
  const low    = findings.filter(f => f.pattern.severity === "LOW").length;
  const total  = findings.length;

  console.log(`${BOLD}─── RESUMO ────────────────────────────────${RESET}`);
  console.log(`  Total de ocorrências : ${BOLD}${total}${RESET}`);
  console.log(`  ${RED}HIGH   : ${high}${RESET}`);
  console.log(`  ${YELLOW}MEDIUM : ${medium}${RESET}`);
  console.log(`  ${CYAN}LOW    : ${low}${RESET}`);
  console.log();

  if (high > 0) {
    console.log(`${RED}${BOLD}⚠ Segredos críticos encontrados! Corrija antes de fazer commit.${RESET}\n`);
    process.exit(1);
  } else if (total > 0) {
    console.log(`${YELLOW}${BOLD}⚠ Possíveis segredos encontrados. Revise com atenção.${RESET}\n`);
    process.exit(1);
  } else {
    process.exit(0);
  }
}
