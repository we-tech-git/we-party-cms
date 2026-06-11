import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/login']
const CMS_PREFIX = '/cms'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // O token é salvo no cookie 'access_token' pelo auth.store.ts após o login.
  // O Zustand persist usa localStorage (inacessível no edge), por isso usamos
  // um cookie dedicado só para o guard de rota.
  const token = request.cookies.get('access_token')?.value ?? null

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))
  const isCms = pathname.startsWith(CMS_PREFIX) || pathname === '/'

  if (pathname === '/') {
    return token
      ? NextResponse.redirect(new URL('/cms/home', request.url))
      : NextResponse.redirect(new URL('/login', request.url))
  }

  if (isCms && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isPublic && token) {
    return NextResponse.redirect(new URL('/cms/home', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)', '/cms/:path*', '/login'],
}
