'use client'

type BulkBarProps = {
  count: number
  isPending: boolean
  onArchive: () => void
  onDelete: () => void
  onClear: () => void
}

export function BulkBar({ count, isPending, onArchive, onDelete, onClear }: BulkBarProps) {
  return (
    <div
      className="fixed bottom-6 left-1/2 z-[70] flex items-center gap-4 rounded-[18px] px-4 py-3 transition-transform duration-[250ms]"
      style={{
        background: '#221A3D',
        color: '#fff',
        boxShadow: '0 20px 50px -16px rgba(34,26,61,.6)',
        transform: count > 0 ? 'translateX(-50%)' : 'translate(-50%, 140%)',
      }}
    >
      <b style={{ fontFamily: 'var(--font-bricolage)' }}>{count} selecionados</b>

      <button
        className="flex items-center gap-2 px-[15px] py-[9px] rounded-[12px] font-extrabold text-[14px] transition-colors"
        style={{ background: 'rgba(255,255,255,.12)' }}
        disabled={isPending}
        onClick={onArchive}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <rect x="3" y="3" width="18" height="5" rx="1"/><path d="M5 8v11a2 2 0 002 2h10a2 2 0 002-2V8M10 12h4"/>
        </svg>
        Arquivar
      </button>

      <button
        className="flex items-center gap-2 px-[15px] py-[9px] rounded-[12px] font-extrabold text-[14px] transition-colors hover:bg-[var(--red,#E0476B)]"
        style={{ background: 'rgba(255,255,255,.12)' }}
        disabled={isPending}
        onClick={onDelete}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
        </svg>
        Excluir
      </button>

      <button
        className="font-bold text-[13px] opacity-60 hover:opacity-100 transition-opacity"
        onClick={onClear}
      >
        Cancelar
      </button>
    </div>
  )
}
