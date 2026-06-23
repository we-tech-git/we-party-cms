/**
 * Extração de papéis tolerante a formato. O retorno do login não é documentado
 * no swagger, então o papel do usuário pode chegar de várias formas:
 *   roles: ['admin']            | roles: [{ name: 'ADMIN' }]
 *   role: 'admin'               | role: { name: 'admin' }
 *   type: 'ADMIN'               | userType: 'admin'
 * Esta função varre todos esses lugares e devolve a lista de nomes encontrados.
 */
export function collectRoleStrings(user: unknown): string[] {
  if (!user || typeof user !== 'object') return []
  const u = user as Record<string, unknown>
  const out: string[] = []

  const fromObj = (o: Record<string, unknown>) => {
    for (const k of ['name', 'role', 'slug', 'type']) {
      if (typeof o[k] === 'string') out.push(o[k] as string)
    }
  }
  const consume = (v: unknown) => {
    if (typeof v === 'string') out.push(v)
    else if (Array.isArray(v)) v.forEach(consume)
    else if (v && typeof v === 'object') fromObj(v as Record<string, unknown>)
  }

  for (const key of ['roles', 'role', 'type', 'userType']) consume(u[key])
  return out
}

export function rolesIncludeAdmin(roles: string[]): boolean {
  return roles.some((r) => r.toLowerCase().includes('admin'))
}
