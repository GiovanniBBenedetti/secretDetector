export interface SecretPattern {
  name: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  regex: RegExp;
  description: string;
}

export const SECRET_PATTERNS: SecretPattern[] = [
  {
    name: "Hardcoded Password",
    severity: "LOW",
    regex: /(?:password|passwd|pwd|secret)\s*[=:]\s*["'][^"']{4,}["']/gi,
    description: "Senha definida diretamente no código-fonte",
  },
  {
    name: "AWS Access Key ID",
    severity: "HIGH",
    regex: /AKIA[0-9A-Z]{16}/g,
    description: "AWS Access Key ID — permite acesso à conta AWS",
  },
  {
    name: "AWS Secret Access Key",
    severity: "HIGH",
    regex: /(?:aws_secret_access_key|aws_secret)\s*[=:]\s*["']?[A-Za-z0-9/+=]{40}["']?/gi,
    description: "AWS Secret Access Key — em conjunto com o ID, dá acesso total à AWS",
  },
  {
    name: "GCP API Key",
    severity: "HIGH",
    regex: /AIza[0-9A-Za-z\-_]{35}/g,
    description: "Google Cloud Platform API Key",
  },
  {
    name: "GCP Service Account",
    severity: "HIGH",
    regex: /[a-z0-9-]+@[a-z0-9-]+\.iam\.gserviceaccount\.com/g,
    description: "Email de service account GCP encontrado no código",
  },
  {
    name: "Azure Storage Key",
    severity: "HIGH",
    regex: /AccountKey=[A-Za-z0-9+/]{86}==/g,
    description: "Azure Storage Account Key",
  },
  {
    name: "Azure Connection String",
    severity: "HIGH",
    regex: /DefaultEndpointsProtocol=https?;AccountName=[^;]+;AccountKey=[^;]+/g,
    description: "Azure Storage Connection String completa",
  },
  {
    name: "JWT Token",
    severity: "MEDIUM",
    regex: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g,
    description: "JSON Web Token (JWT) — pode conter dados de autenticação",
  },
  {
    name: "Generic Bearer Token",
    severity: "MEDIUM",
    regex: /[Bb]earer\s+[A-Za-z0-9\-._~+/]+=*/g,
    description: "Bearer token hardcoded em cabeçalho HTTP",
  },
  {
    name: "Generic API Key",
    severity: "MEDIUM",
    regex: /(?:api[_-]?key|apikey)\s*[=:]\s*["'][A-Za-z0-9\-_]{20,}["']/gi,
    description: "Chave de API genérica encontrada no código",
  },
  {
    name: "Generic Secret",
    severity: "MEDIUM",
    regex: /(?:secret|token)\s*[=:]\s*["'][A-Za-z0-9\-_./+=]{16,}["']/gi,
    description: "Token ou segredo genérico encontrado no código",
  },
];
