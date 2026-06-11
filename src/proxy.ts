import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/login']
const CMS_PREFIX = '/cms'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Lê o token da store Zustand (salva em cookie via zustand/middleware persist)
  // Fallback: lê o cookie direto que setamos no login
  const authCookie = request.cookies.get('we-party-auth')
  let token: string | null = null

  if (authCookie?.value) {
    try {
      const parsed = JSON.parse(authCookie.value)
      token = parsed?.state?.token ?? null
    } catch {
      token = null
    }
  }

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))
  const isCms = pathname.startsWith(CMS_PREFIX) || pathname === '/'

  // Redireciona / → /cms/home
  if (pathname === '/') {
    if (token) return NextResponse.redirect(new URL('/cms/home', request.url))
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Rota CMS sem token → login
  if (isCms && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Login com token já ativo → home
  if (isPublic && token) {
    return NextResponse.redirect(new URL('/cms/home', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)', '/cms/:path*', '/login'],
}
