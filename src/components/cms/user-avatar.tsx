'use client'

/**
 * Avatar global do usuário.
 *
 * Mostra a foto de perfil quando existe; caso contrário (ou se a imagem falhar
 * ao carregar) exibe as iniciais do nome sobre um gradiente estável. É o
 * componente único usado em todo o CMS para a foto/identidade do usuário.
 */

import { useState } from 'react'
import type { CSSProperties } from 'react'

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#FF5FA6,#FF9D3D)',
  'linear-gradient(135deg,#7C5CFF,#C54BFF)',
  'linear-gradient(135deg,#3E7BFB,#5B93FF)',
  'linear-gradient(135deg,#10A87D,#34D399)',
  'linear-gradient(135deg,#F59E0B,#FBBF24)',
  'linear-gradient(135deg,#EC4899,#F472B6)',
  'linear-gradient(135deg,#06B6D4,#3B82F6)',
  'linear-gradient(135deg,#8B5CF6,#EC4899)',
]

/** Iniciais do primeiro + segundo nome (ou só o primeiro, quando há um nome). */
export function getInitials(name: string): string {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const first = parts[0]?.[0] ?? ''
  if (parts.length === 1) return first.toUpperCase()
  const second = parts[1]?.[0] ?? ''
  return (first + second).toUpperCase()
}

/** Gradiente estável por `seed` (default: nome). */
export function avatarGradientFor(seed: string): string {
  if (!seed) return AVATAR_GRADIENTS[0]!
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length]!
}

export function UserAvatar({
  name,
  image,
  size = 40,
  radius = 9999,
  seed,
  className = '',
  style,
}: {
  name: string
  image?: string | null
  size?: number
  radius?: number
  seed?: string
  className?: string
  style?: CSSProperties
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const showImage = !!image && image !== failedSrc
  const base = `flex-none overflow-hidden ${className}`

  if (showImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image!}
        alt={name}
        className={`${base} object-cover`}
        style={{ width: size, height: size, borderRadius: radius, ...style }}
        onError={() => setFailedSrc(image!)}
      />
    )
  }

  return (
    <span
      className={`${base} grid place-items-center text-white font-extrabold`}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: avatarGradientFor(seed ?? name),
        fontSize: Math.round(size * 0.4),
        fontFamily: 'var(--font-bricolage)',
        ...style,
      }}
    >
      {getInitials(name)}
    </span>
  )
}
