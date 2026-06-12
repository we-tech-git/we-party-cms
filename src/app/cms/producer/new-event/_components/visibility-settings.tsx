'use client'

import { useController } from 'react-hook-form'
import { GRAD } from '@/lib/brand'
import type { CreateEventForm } from '../_schema'

function SegmentedToggle({
  value,
  onChange,
  options,
}: {
  value: boolean
  onChange: (v: boolean) => void
  options: [{ label: string; icon: React.ReactNode; value: true }, { label: string; icon?: React.ReactNode; value: false }]
}) {
  return (
    <div className="flex gap-[6px] rounded-[15px] p-[6px]" style={{ background: '#F4EFF6' }}>
      {options.map((opt) => {
        const active = value === opt.value
        return (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onChange(opt.value)}
            className="flex-1 flex items-center justify-center gap-[7px] rounded-[11px] px-3 py-[13px] font-extrabold text-[14px] transition-all"
            style={{
              background: active ? GRAD : 'transparent',
              color: active ? '#fff' : 'var(--ink-soft)',
              boxShadow: active ? '0 10px 20px -10px rgba(240,48,154,.7)' : 'none',
            }}
          >
            {opt.icon}
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export function VisibilitySettings() {
  const { field: { value: isPublic, onChange: setIsPublic } } = useController<CreateEventForm, 'isPublic'>({ name: 'isPublic' })
  const { field: { value: allowComments, onChange: setAllowComments } } = useController<CreateEventForm, 'allowComments'>({ name: 'allowComments' })

  return (
    <>
      {/* Visibility card */}
      <div
        className="rounded-[var(--r)] p-6"
        style={{ background: '#fff', border: '1px solid var(--line-2)', boxShadow: 'var(--shadow-sm)' }}
      >
        <div className="flex items-center gap-[11px] mb-[18px]">
          <span
            className="w-[38px] h-[38px] rounded-[12px] grid place-items-center flex-none"
            style={{ background: '#EEEAFF', color: 'var(--violet)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </span>
          <h3 className="font-bold text-[16px]" style={{ fontFamily: 'var(--font-bricolage)' }}>Visibilidade</h3>
        </div>

        <SegmentedToggle
          value={isPublic}
          onChange={setIsPublic}
          options={[
            {
              label: 'Público',
              value: true,
              icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M3 12h18M12 3a15 15 0 010 18M12 3a15 15 0 000 18" />
                </svg>
              ),
            },
            {
              label: 'Privado',
              value: false,
              icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="9" cy="8" r="3.2" />
                  <path d="M3 20v-1a6 6 0 0112 0v1" />
                </svg>
              ),
            },
          ]}
        />

        <div className="mt-3 text-[13px] font-medium leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
          {isPublic ? (
            <>
              <span
                className="inline-block text-[10.5px] font-extrabold tracking-[.06em] uppercase rounded-[7px] px-[9px] py-[3px] mb-2"
                style={{ background: '#EEEAFF', color: 'var(--violet)' }}
              >
                Aparece na descoberta
              </span>
              <br />
              Eventos públicos entram no feed &ldquo;O que tá rolando&rdquo;, onde podem ser curtidos, comentados e compartilhados — é assim que seu alcance cresce.
            </>
          ) : (
            <>
              <span
                className="inline-block text-[10.5px] font-extrabold tracking-[.06em] uppercase rounded-[7px] px-[9px] py-[3px] mb-2"
                style={{ background: '#FFE9F2', color: 'var(--pink)' }}
              >
                Somente convidados
              </span>
              <br />
              Eventos privados não aparecem para o público geral, mas podem aparecer para seus seguidores ou só para quem você convidar.
            </>
          )}
        </div>
      </div>

      {/* Comments card */}
      <div
        className="rounded-[var(--r)] p-6"
        style={{ background: '#fff', border: '1px solid var(--line-2)', boxShadow: 'var(--shadow-sm)' }}
      >
        <div className="flex items-center gap-[11px] mb-[18px]">
          <span
            className="w-[38px] h-[38px] rounded-[12px] grid place-items-center flex-none"
            style={{ background: '#E6F1FF', color: 'var(--blue)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M21 15a4 4 0 01-4 4H8l-5 4V7a4 4 0 014-4h10a4 4 0 014 4z" />
            </svg>
          </span>
          <h3 className="font-bold text-[16px]" style={{ fontFamily: 'var(--font-bricolage)' }}>Comentários</h3>
        </div>

        <SegmentedToggle
          value={allowComments}
          onChange={setAllowComments}
          options={[
            { label: 'Permitidos', value: true, icon: undefined },
            { label: 'Não permitidos', value: false, icon: undefined },
          ]}
        />

        <p className="mt-3 text-[13px] font-medium leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
          Comentários aumentam o engajamento e ajudam o evento a subir na descoberta. Você consegue responder pelo painel.
        </p>
      </div>

      {/* Tips card */}
      <div
        className="rounded-[var(--r)] p-6"
        style={{ background: 'linear-gradient(150deg,#2a1340,#4a1f5e)', border: 'none' }}
      >
        <div className="flex items-center gap-[11px] mb-[18px]">
          <span
            className="w-[38px] h-[38px] rounded-[12px] grid place-items-center flex-none"
            style={{ background: 'rgba(255,255,255,.14)', color: '#fff' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7c.6.5 1 1.2 1 2h6c0-.8.4-1.5 1-2A7 7 0 0012 2z" />
            </svg>
          </span>
          <h3 className="font-bold text-[16px] text-white" style={{ fontFamily: 'var(--font-bricolage)' }}>Dicas pra bombar</h3>
        </div>

        {[
          { emoji: '📸', text: <>Capa nítida e vertical-friendly tem <b>+60% de cliques</b> no feed.</> },
          { emoji: '🏷️', text: 'Marque de 3 a 5 interesses certos pra alcançar o público ideal.' },
          { emoji: '⚡', text: 'Eventos públicos com comentários ativos sobem mais rápido na descoberta.' },
        ].map((tip, i) => (
          <div key={i} className="flex gap-[11px] items-start text-[13px] font-medium text-white opacity-90 mb-[11px] last:mb-0">
            <span
              className="w-[24px] h-[24px] rounded-[8px] grid place-items-center flex-none text-[13px]"
              style={{ background: 'rgba(255,255,255,.14)' }}
            >
              {tip.emoji}
            </span>
            <div>{tip.text}</div>
          </div>
        ))}
      </div>
    </>
  )
}
