/**
 * Cookie `access_token` lido pelo `proxy.ts` (edge) para proteger /cms/*.
 *
 * LIMITAÇÃO CONHECIDA: é escrito via JS, então NÃO pode ser HttpOnly (um XSS consegue lê-lo).
 * A correção definitiva (cookie HttpOnly emitido pelo backend/BFF) está na tarefa de segurança do CMS
 * — ver docs/SECURITY.md. Enquanto isso: SameSite=Lax e `Secure` sempre que a página é HTTPS.
 * JWT só usa Base64URL + pontos — não precisa de encoding.
 */
export function writeAuthCookie(token: string) {
  const secure = typeof location !== 'undefined' && location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `access_token=${token}; path=/; SameSite=Lax${secure}`
}

export function clearAuthCookie() {
  const secure = typeof location !== 'undefined' && location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `access_token=; path=/; max-age=0; SameSite=Lax${secure}`
}
