import { Finding } from "./scanner";

interface ReportFinding {
  file: string;
  line: number;
  severity: "HIGH" | "MEDIUM" | "LOW";
  type: string;
  description: string;
  match: string;
  lineContent: string;
}

interface Report {
  version: string;
  scannedAt: string;
  target: string;
  summary: { total: number; high: number; medium: number; low: number };
  findings: ReportFinding[];
}

function maskSecret(value: string): string {
  if (value.length <= 4) return "****";
  return value.slice(0, 4) + "*".repeat(Math.min(value.length - 4, 20));
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildReport(findings: Finding[], target: string): Report {
  const high   = findings.filter(f => f.pattern.severity === "HIGH").length;
  const medium = findings.filter(f => f.pattern.severity === "MEDIUM").length;
  const low    = findings.filter(f => f.pattern.severity === "LOW").length;

  return {
    version: "4.0.0",
    scannedAt: new Date().toISOString(),
    target,
    summary: { total: findings.length, high, medium, low },
    findings: findings.map(f => ({
      file: f.filePath,
      line: f.lineNumber,
      severity: f.pattern.severity,
      type: f.pattern.name,
      description: f.pattern.description,
      match: maskSecret(f.match),
      lineContent: f.lineContent,
    })),
  };
}

export function toJson(findings: Finding[], target: string): string {
  return JSON.stringify(buildReport(findings, target), null, 2);
}

export function toHtml(findings: Finding[], target: string): string {
  const r = buildReport(findings, target);

  const severityColor: Record<string, string> = {
    HIGH: "#f85149",
    MEDIUM: "#e3b341",
    LOW: "#58a6ff",
  };
  const severityBg: Record<string, string> = {
    HIGH: "rgba(248,81,73,0.15)",
    MEDIUM: "rgba(227,179,65,0.15)",
    LOW: "rgba(88,166,255,0.15)",
  };

  const rows = r.findings.map(f => `
        <tr>
          <td class="mono file">${escapeHtml(f.file)}</td>
          <td>${f.line}</td>
          <td><span class="badge" style="color:${severityColor[f.severity]};background:${severityBg[f.severity]}">${f.severity}</span></td>
          <td>${escapeHtml(f.type)}</td>
          <td class="mono code">${escapeHtml(f.lineContent)}</td>
          <td class="mono" style="color:${severityColor[f.severity]}">${escapeHtml(f.match)}</td>
        </tr>`).join("");

  const body = r.findings.length === 0
    ? `<div class="no-findings">&#10004; No secrets found</div>`
    : `<table>
      <thead>
        <tr><th>File</th><th>Line</th><th>Severity</th><th>Type</th><th>Line Content</th><th>Match</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Secret Detector Report</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #0d1117; color: #c9d1d9; min-height: 100vh; }
    header { background: #161b22; border-bottom: 1px solid #30363d; padding: 24px 32px; }
    header h1 { font-size: 22px; font-weight: 700; color: #f0f6fc; }
    .meta { margin-top: 8px; font-size: 12px; color: #8b949e; display: flex; gap: 24px; flex-wrap: wrap; }
    main { padding: 32px; }
    .summary { display: flex; gap: 16px; margin-bottom: 28px; flex-wrap: wrap; }
    .card { flex: 1; min-width: 110px; background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 18px 20px; text-align: center; }
    .card .num { font-size: 32px; font-weight: 700; line-height: 1; }
    .card .lbl { font-size: 12px; color: #8b949e; margin-top: 6px; letter-spacing: 0.5px; }
    .card.total .num { color: #f0f6fc; }
    .card.high  .num { color: #f85149; }
    .card.medium .num { color: #e3b341; }
    .card.low   .num { color: #58a6ff; }
    table { width: 100%; border-collapse: collapse; background: #161b22; border: 1px solid #30363d; border-radius: 8px; overflow: hidden; font-size: 13px; }
    thead tr { background: #21262d; }
    th { padding: 10px 14px; text-align: left; color: #8b949e; font-weight: 600; font-size: 12px; border-bottom: 1px solid #30363d; white-space: nowrap; }
    td { padding: 9px 14px; border-bottom: 1px solid #21262d; vertical-align: middle; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #1c2128; }
    .badge { padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; white-space: nowrap; }
    .mono { font-family: ui-monospace, "SFMono-Regular", Consolas, monospace; font-size: 12px; }
    .file { color: #58a6ff; max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .code { color: #8b949e; max-width: 320px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .no-findings { text-align: center; padding: 56px; color: #3fb950; font-size: 18px; font-weight: 600; background: #161b22; border: 1px solid #30363d; border-radius: 8px; }
  </style>
</head>
<body>
  <header>
    <h1>Secret Detector Report</h1>
    <div class="meta">
      <span>Target: ${escapeHtml(r.target)}</span>
      <span>Scanned at: ${r.scannedAt}</span>
      <span>Version: ${r.version}</span>
    </div>
  </header>
  <main>
    <div class="summary">
      <div class="card total"><div class="num">${r.summary.total}</div><div class="lbl">TOTAL</div></div>
      <div class="card high"><div class="num">${r.summary.high}</div><div class="lbl">HIGH</div></div>
      <div class="card medium"><div class="num">${r.summary.medium}</div><div class="lbl">MEDIUM</div></div>
      <div class="card low"><div class="num">${r.summary.low}</div><div class="lbl">LOW</div></div>
    </div>
    ${body}
  </main>
</body>
</html>`;
}
