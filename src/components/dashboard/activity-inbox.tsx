'use client'

import { useRouter } from 'next/navigation'
import { useI18n } from '@/i18n/context'

type ActivityItem =
  | { type: 'comment'; avatarGradient: string; initial: string; description: React.ReactNode; comment: string }
  | { type: 'activity'; avatarBg: string; avatarColor: string; symbol: string; description: React.ReactNode; time: string }

const items: ActivityItem[] = [
  {
    type: 'comment',
    avatarGradient: 'linear-gradient(135deg,#ff7a59,#ff4d8d)',
    initial: 'M',
    description: (
      <><strong>Marina A.</strong> comentou na <strong>Sunset Beach Party</strong></>
    ),
    comment: '"Vai ter line-up de DJs? 🎧"',
  },
  {
    type: 'activity',
    avatarBg: '#FFE9F2',
    avatarColor: 'var(--pink)',
    symbol: '♥',
    description: <><strong>+23 curtidas</strong> na Sunset Beach Party</>,
    time: 'há 2 horas',
  },
  {
    type: 'activity',
    avatarBg: '#E6FBF3',
    avatarColor: 'var(--green)',
    symbol: '↗',
    description: <>Seu evento foi <strong>compartilhado 14×</strong> hoje</>,
    time: 'Sunset Beach Party · há 5 horas',
  },
  {
    type: 'activity',
    avatarBg: '#EEEAFF',
    avatarColor: 'var(--violet)',
    symbol: '✓',
    description: <><strong>+38 confirmados</strong> (&quot;Eu vou!&quot;) esta semana</>,
    time: 'somando todos os eventos',
  },
]

export function ActivityInbox() {
  const router = useRouter()
  const { t } = useI18n()
  return (
    <div
      className="rounded-(--r) px-6 py-5.5"
      style={{ background: '#fff', border: '1px solid var(--line-2)', boxShadow: 'var(--shadow-sm)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.75 mb-1">
        <span
          className="w-9.5 h-9.5 rounded-[12px] grid place-items-center flex-none"
          style={{ background: '#E6F1FF', color: 'var(--blue)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M21 15a4 4 0 01-4 4H8l-5 4V7a4 4 0 014-4h10a4 4 0 014 4z" />
          </svg>
        </span>
        <h3 className="font-bold text-[18px]" style={{ fontFamily: 'var(--font-bricolage)' }}>
          {t('home.recentActivityTitle')}
        </h3>
        <button
          onClick={() => router.push('/cms/producer/my-events')}
          className="ml-auto font-extrabold text-[13px]"
          style={{ color: 'var(--pink)' }}
        >
          {t('common.all')}
        </button>
      </div>

      {/* Feed */}
      {items.map((item, i) => (
        <div
          key={i}
          className="flex gap-3 py-3.25 items-start"
          style={{ borderBottom: i < items.length - 1 ? '1px solid var(--line-2)' : 'none' }}
        >
          {item.type === 'comment' ? (
            <span
              className="w-9.5 h-9.5 rounded-[11px] grid place-items-center text-white font-extrabold flex-none text-[14px]"
              style={{ background: item.avatarGradient }}
            >
              {item.initial}
            </span>
          ) : (
            <span
              className="w-9.5 h-9.5 rounded-[11px] grid place-items-center font-extrabold flex-none"
              style={{ background: item.avatarBg, color: item.avatarColor }}
            >
              {item.symbol}
            </span>
          )}

          <div className="flex-1 min-w-0">
            <p className="text-[13.5px] font-semibold">{item.description}</p>
            {item.type === 'comment' && (
              <>
                <p className="text-[13px] mt-0.5" style={{ color: 'var(--ink-soft)', fontWeight: 500 }}>
                  {item.comment}
                </p>
                <button
                  onClick={() => router.push('/cms/producer/my-events')}
                  className="mt-1.5 font-extrabold text-[12.5px]"
                  style={{ color: 'var(--blue)' }}
                >
                  {t('common.reply')} →
                </button>
              </>
            )}
            {item.type === 'activity' && (
              <div className="text-[12px] font-semibold mt-0.5" style={{ color: 'var(--wp-muted)' }}>
                {item.time}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
