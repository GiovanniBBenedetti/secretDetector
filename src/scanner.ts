import * as fs from "fs";
import * as path from "path";
import { SECRET_PATTERNS, SecretPattern } from "./patterns";

export interface Finding {
  filePath: string;
  lineNumber: number;
  lineContent: string;
  pattern: SecretPattern;
  match: string;
}

const ALLOWED_EXTENSIONS = new Set([
  ".ts", ".js", ".tsx", ".jsx",
  ".py", ".rb", ".go", ".java", ".cs",
  ".env", ".yml", ".yaml", ".json",
  ".xml", ".toml", ".ini", ".cfg",
  ".sh", ".bash", ".zsh",
  ".tf",
  ".properties",
]);

const IGNORED_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  "__pycache__",
  ".venv",
  "venv",
]);

function shouldScanFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return ALLOWED_EXTENSIONS.has(ext);
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

export function scanFile(filePath: string): Finding[] {
  const findings: Finding[] = [];

  let content: string;
  try {
    content = fs.readFileSync(filePath, "utf-8");
  } catch {
    return findings;
  }

  const lines = content.split("\n");

  lines.forEach((line, index) => {
    for (const pattern of SECRET_PATTERNS) {
      // Regex com flag /g mantém estado interno (lastIndex), então recriamos a cada iteração
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

  return findings;
}

export function scanDirectory(dirPath: string, ignorePatterns: string[] = []): Finding[] {
  const findings: Finding[] = [];

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true });
  } catch {
    return findings;
  }

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      if (matchesIgnorePattern(fullPath, ignorePatterns)) continue;
      findings.push(...scanDirectory(fullPath, ignorePatterns));
    } else if (entry.isFile() && shouldScanFile(fullPath)) {
      if (matchesIgnorePattern(fullPath, ignorePatterns)) continue;
      findings.push(...scanFile(fullPath));
    }
  }

  return findings;
}
