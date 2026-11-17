/**
 * Feature flags de build (variáveis `NEXT_PUBLIC_*` são embutidas no bundle:
 * ligar/desligar exige novo deploy). A referência a `process.env.NEXT_PUBLIC_...`
 * precisa ser literal, senão o Next não a substitui no cliente.
 */

/** Página de desempenho por evento (funil). Ligada só com o valor exato "true". */
export const EVENT_INSIGHTS_ENABLED = process.env.NEXT_PUBLIC_FF_EVENT_INSIGHTS === 'true'
