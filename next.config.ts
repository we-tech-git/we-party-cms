import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

/**
 * Cabeçalhos de segurança básicos (checklist em AGENTS.md › "Checklist de segurança").
 * CSP completa NÃO está aqui de propósito: precisa de rollout em modo report-only por causa do
 * Google Identity Services e do ViaCEP — fica na tarefa de segurança do CMS (docs/SECURITY.md).
 */
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // allow-popups: o popup do login com Google precisa falar com a janela de origem.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  ...(isProd ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }] : []),
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
