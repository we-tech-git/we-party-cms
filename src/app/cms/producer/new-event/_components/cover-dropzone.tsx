'use client'

import { useRef, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import type { CreateEventForm } from '../_schema'

export function CoverDropzone() {
  const { setValue, watch } = useFormContext<CreateEventForm>()
  const photo = watch('photo')
  const [preview, setPreview] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function setFile(file: File) {
    if (!file.type.startsWith('image/')) return
    setValue('photo', file)
    const url = URL.createObjectURL(file)
    setPreview(url)
  }

  function handleFiles(files: FileList | null) {
    if (files?.[0]) setFile(files[0])
  }

  const hasPhoto = !!photo && !!preview

  return (
    <div
      className={[
        'relative overflow-hidden rounded-[20px] min-h-[230px] flex flex-col items-center justify-center gap-2 text-center',
        'cursor-pointer transition-transform duration-150',
        dragging ? '-translate-y-0.5' : '',
        hasPhoto ? 'border-0' : 'border-2 border-dashed border-[#f0b9d2]',
      ].join(' ')}
      style={{
        background: hasPhoto ? 'transparent' : 'linear-gradient(135deg,#FFF6FA,#FBF4FF)',
        backgroundImage: hasPhoto ? `url(${preview})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      onClick={() => !hasPhoto && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragEnter={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        handleFiles(e.dataTransfer.files)
      }}
    >
      {!hasPhoto && (
        <>
          <span
            className="w-[60px] h-[60px] rounded-[18px] grid place-items-center mb-2"
            style={{ background: '#fff', boxShadow: 'var(--shadow-sm)' }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--violet)" strokeWidth="2.2">
              <path d="M12 16V4M8 8l4-4 4 4" />
              <path d="M20 16v3a2 2 0 01-2 2H6a2 2 0 01-2-2v-3" />
            </svg>
          </span>
          <strong className="font-extrabold text-[18px]" style={{ fontFamily: 'var(--font-bricolage)' }}>
            Adicione a imagem de capa
          </strong>
          <span className="font-semibold text-[14px]" style={{ color: 'var(--ink-soft)' }}>
            Arraste e solte ou clique para enviar
          </span>
          <span className="font-medium text-[13px]" style={{ color: 'var(--wp-muted)' }}>
            É a primeira coisa que o público vê no feed — escolha uma foto que chame atenção 🔥
          </span>
        </>
      )}

      {hasPhoto && (
        <div
          className="absolute inset-0 flex items-end justify-end p-4"
          style={{ background: 'linear-gradient(to top,rgba(20,8,30,.55),transparent 55%)' }}
        >
          <button
            type="button"
            className="flex items-center gap-2 rounded-[11px] px-[15px] py-[9px] font-extrabold text-[13px]"
            style={{ background: 'rgba(255,255,255,.92)', color: 'var(--ink)' }}
            onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" />
            </svg>
            Trocar imagem
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  )
}
