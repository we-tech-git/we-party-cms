'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/** Subconjunto da API do Google Identity Services usado aqui (fluxo OAuth2 code, popup). */
type CodeResponse = { code?: string; error?: string }
type CodeClient = { requestCode: () => void }
type GoogleOAuth2 = {
  initCodeClient: (cfg: {
    client_id: string
    scope: string
    ux_mode: 'popup'
    callback: (r: CodeResponse) => void
    error_callback?: () => void
  }) => CodeClient
}
declare global {
  interface Window {
    google?: { accounts?: { oauth2?: GoogleOAuth2 } }
  }
}

const GSI_SRC = 'https://accounts.google.com/gsi/client'
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ''

/**
 * Carrega o Google Identity Services sob demanda e expõe `requestCode()`.
 * Devolve o *authorization code* (nunca o token) — a troca por sessão é feita no backend
 * (`POST /users/google-auth { code }`). Sem `NEXT_PUBLIC_GOOGLE_CLIENT_ID` o login com Google fica indisponível.
 */
export function useGoogleCode(onCode: (code: string) => void, onError: () => void) {
  const clientRef = useRef<CodeClient | null>(null)
  const [ready, setReady] = useState(false)
  const enabled = GOOGLE_CLIENT_ID.length > 0
  const cbs = useRef({ onCode, onError })
  useEffect(() => {
    cbs.current = { onCode, onError }
  })

  useEffect(() => {
    if (!enabled) return
    const init = () => {
      const oauth2 = window.google?.accounts?.oauth2
      if (!oauth2) return
      clientRef.current = oauth2.initCodeClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'openid email profile',
        ux_mode: 'popup',
        callback: (r) => (r.code ? cbs.current.onCode(r.code) : cbs.current.onError()),
        error_callback: () => cbs.current.onError(),
      })
      setReady(true)
    }
    if (window.google?.accounts?.oauth2) return init()
    let script = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`)
    if (!script) {
      script = document.createElement('script')
      script.src = GSI_SRC
      script.async = true
      document.head.appendChild(script)
    }
    script.addEventListener('load', init)
    return () => script?.removeEventListener('load', init)
  }, [enabled])

  const requestCode = useCallback(() => clientRef.current?.requestCode(), [])
  return { enabled, ready, requestCode }
}
