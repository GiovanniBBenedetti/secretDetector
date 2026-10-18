import { execSync } from "child_process";
import * as path from "path";
import { SECRET_PATTERNS } from "./patterns";
import { Finding } from "./scanner";

const SCANNABLE_EXTENSIONS = new Set([
  ".ts", ".js", ".tsx", ".jsx",
  ".py", ".rb", ".go", ".java", ".cs",
  ".env", ".yml", ".yaml", ".json",
  ".xml", ".toml", ".ini", ".cfg",
  ".sh", ".bash", ".zsh",
  ".tf", ".properties",
]);

function isScannable(filePath: string): boolean {
  return SCANNABLE_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function matchesIgnorePattern(filePath: string, patterns: string[]): boolean {
  if (patterns.length === 0) return false;
  const normalized = filePath.replace(/\\/g, "/");
  return patterns.some(pattern => {
    const p = pattern.replace(/\\/g, "/");
    if (p.startsWith("*.")) return normalized.endsWith(p.slice(1));
    if (p.endsWith("/**")) return normalized.includes(p.slice(0, -3) + "/");
    return normalized.includes(p);
  });
}

export function isGitRepo(): boolean {
  try {
    execSync("git rev-parse --is-inside-work-tree", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

export function getStagedFiles(): string[] {
  try {
    const output = execSync("git diff --cached --name-only", { encoding: "utf-8" });
    return output.trim().split("\n").filter(f => f.length > 0);
  } catch {
    return [];
  }
}

export function getStagedContent(filePath: string): string {
  try {
    return execSync(`git show ":${filePath}"`, { encoding: "utf-8" });
  } catch {
    return "";
  }
}

export function scanStagedFiles(ignorePatterns: string[] = []): Finding[] {
  const findings: Finding[] = [];
  const stagedFiles = getStagedFiles()
    .filter(isScannable)
    .filter(f => !matchesIgnorePattern(f, ignorePatterns));

  for (const filePath of stagedFiles) {
    const content = getStagedContent(filePath);
    if (!content) continue;

    const lines = content.split("\n");
    lines.forEach((line, index) => {
      for (const pattern of SECRET_PATTERNS) {
        const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
        const matches = line.matchAll(regex);
        for (const match of matches) {
          findings.push({
            filePath,
            lineNumber: index + 1,
            lineContent: line.trim(),
            pattern,
            match: match[0],
          });
        }
      }
    });
  }

  return findings;
}
