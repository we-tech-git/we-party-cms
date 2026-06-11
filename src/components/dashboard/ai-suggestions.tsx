type Suggestion = {
  emoji: string
  emojiBg: string
  title: string
  description: React.ReactNode
  ctaLabel: string
}

const suggestions: Suggestion[] = [
  {
    emoji: '🚀',
    emojiBg: '#FFE9F2',
    title: 'Impulsione a Sunset Beach Party',
    description: 'Está em #3 e a 1.200 impressões do Top 1. Um boost agora pode levá-la ao topo da descoberta.',
    ctaLabel: 'Impulsionar →',
  },
  {
    emoji: '🎤',
    emojiBg: '#EEEAFF',
    title: 'Adicione as atrações na Neon Night',
    description: (
      <>
        Eventos com lineup recebem em média <strong>+60% de curtidas</strong>. Enriqueça a página antes de publicar.
      </>
    ),
    ctaLabel: 'Adicionar atrações →',
  },
  {
    emoji: '💬',
    emojiBg: '#E6F1FF',
    title: 'Responda os comentários',
    description: 'Você tem 4 comentários sem resposta. Interagir aumenta o engajamento e o alcance do evento.',
    ctaLabel: 'Responder →',
  },
  {
    emoji: '📣',
    emojiBg: '#E6FBF3',
    title: 'Compartilhe nas redes sociais',
    description: 'Sem posts há 3 dias. Um story com o link do evento traz visitas direto pra sua página.',
    ctaLabel: 'Gerar post →',
  },
]

export function AiSuggestions() {
  return (
    <div
      className="rounded-[var(--r)] px-6 py-[22px]"
      style={{ background: '#fff', border: '1px solid var(--line-2)', boxShadow: 'var(--shadow-sm)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-[11px] mb-4">
        <span
          className="w-[38px] h-[38px] rounded-[12px] grid place-items-center flex-none"
          style={{ background: 'linear-gradient(135deg,#FFD36E,#FF9E45)', color: '#fff' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7c.6.5 1 1.2 1 2h6c0-.8.4-1.5 1-2A7 7 0 0012 2z" />
          </svg>
        </span>
        <h3 className="font-bold text-[18px]" style={{ fontFamily: 'var(--font-bricolage)' }}>
          Sugestões da IA
        </h3>
      </div>

      {/* Suggestions */}
      {suggestions.map((s, i) => (
        <div
          key={i}
          className="flex gap-3.5 py-3.5"
          style={{ borderBottom: i < suggestions.length - 1 ? '1px solid var(--line-2)' : 'none' }}
        >
          <span
            className="w-10 h-10 rounded-[12px] grid place-items-center flex-none text-[18px]"
            style={{ background: s.emojiBg }}
          >
            {s.emoji}
          </span>
          <div className="flex-1 min-w-0">
            <strong className="text-[14px]">{s.title}</strong>
            <p className="text-[12.5px] mt-0.5 mb-2.5" style={{ color: 'var(--ink-soft)', fontWeight: 500 }}>
              {s.description}
            </p>
            <button
              className="inline-flex items-center gap-1.5 font-extrabold text-[13px] px-3 py-[7px] rounded-[10px] border-[1.5px] transition hover:bg-[#FFE0EC]"
              style={{ color: 'var(--pink)', borderColor: '#ffd9e6' }}
            >
              {s.ctaLabel}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
