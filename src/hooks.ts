import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

const HOOK_MARKER = "# installed-by: secret-detector";

const HOOK_SCRIPT = `#!/bin/sh
${HOOK_MARKER}
cd "$(git rev-parse --show-toplevel)"
npx ts-node src/index.ts --staged
exit $?
`;

function getGitRoot(): string {
  try {
    return execSync("git rev-parse --show-toplevel", { encoding: "utf-8" }).trim();
  } catch {
    throw new Error("Não é um repositório git.");
  }
}

export function installHook(): void {
  const gitRoot = getGitRoot();
  const hookPath = path.join(gitRoot, ".git", "hooks", "pre-commit");

  if (fs.existsSync(hookPath)) {
    const existing = fs.readFileSync(hookPath, "utf-8");
    if (existing.includes(HOOK_MARKER)) {
      console.log("✔ Hook já instalado.");
      return;
    }
    fs.writeFileSync(hookPath + ".bak", existing);
    console.log("⚠  Hook existente salvo em pre-commit.bak");
  }

  fs.writeFileSync(hookPath, HOOK_SCRIPT, { encoding: "utf-8" });
  try { fs.chmodSync(hookPath, 0o755); } catch { /* Windows ignores chmod */ }
  console.log(`✔ Pre-commit hook instalado em ${hookPath}`);
  console.log("  A partir de agora todo commit escaneia arquivos em stage.");
}

export function uninstallHook(): void {
  const gitRoot = getGitRoot();
  const hookPath = path.join(gitRoot, ".git", "hooks", "pre-commit");

  if (!fs.existsSync(hookPath)) {
    console.log("Hook não encontrado.");
    return;
  }

  const content = fs.readFileSync(hookPath, "utf-8");
  if (!content.includes(HOOK_MARKER)) {
    console.log("⚠  Hook atual não pertence ao Secret Detector. Nada removido.");
    return;
  }

  fs.unlinkSync(hookPath);

  const backupPath = hookPath + ".bak";
  if (fs.existsSync(backupPath)) {
    fs.renameSync(backupPath, hookPath);
    console.log("✔ Hook anterior restaurado.");
  } else {
    console.log("✔ Pre-commit hook removido.");
  }
}
