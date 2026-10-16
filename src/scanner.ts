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

export function scanDirectory(dirPath: string): Finding[] {
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
      findings.push(...scanDirectory(fullPath));
    } else if (entry.isFile() && shouldScanFile(fullPath)) {
      findings.push(...scanFile(fullPath));
    }
  }

  return findings;
}
