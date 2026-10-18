import * as fs from "fs";
import * as path from "path";

export interface Config {
  severity: "HIGH" | "MEDIUM" | "LOW";
  ignore: string[];
}

const DEFAULTS: Config = {
  severity: "LOW",
  ignore: [],
};

const VALID_SEVERITIES = new Set(["HIGH", "MEDIUM", "LOW"]);

export function loadConfig(startDir: string = process.cwd()): Config {
  const configPath = findConfigFile(startDir);
  if (!configPath) return { ...DEFAULTS };

  try {
    const raw = fs.readFileSync(configPath, "utf-8");
    const parsed = JSON.parse(raw) as Record<string, unknown>;

    const severity =
      typeof parsed.severity === "string" && VALID_SEVERITIES.has(parsed.severity)
        ? (parsed.severity as Config["severity"])
        : DEFAULTS.severity;

    const ignore = Array.isArray(parsed.ignore)
      ? (parsed.ignore as unknown[]).filter((p): p is string => typeof p === "string")
      : DEFAULTS.ignore;

    return { severity, ignore };
  } catch {
    return { ...DEFAULTS };
  }
}

function findConfigFile(dir: string): string | null {
  const candidate = path.join(dir, ".secretdetectorrc");
  if (fs.existsSync(candidate)) return candidate;
  const parent = path.dirname(dir);
  if (parent === dir) return null;
  return findConfigFile(parent);
}
