'use client'

import { useRef, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import type { CreateEventForm } from '../_schema'
import { MAX_PHOTOS } from '../_schema'

export function CoverDropzone() {
  const { setValue } = useFormContext<CreateEventForm>()
  const [localFiles, setLocalFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const hasPhotos = previews.length > 0
  const atLimit = localFiles.length >= MAX_PHOTOS

  function addFiles(incoming: FileList | null) {
    if (!incoming) return
    const valid = Array.from(incoming).filter(f => f.type.startsWith('image/'))
    if (!valid.length) return
    const available = MAX_PHOTOS - localFiles.length
    const toAdd = valid.slice(0, available)
    if (!toAdd.length) return
    const newPreviews = toAdd.map(f => URL.createObjectURL(f))
    const updatedFiles = [...localFiles, ...toAdd]
    const updatedPreviews = [...previews, ...newPreviews]
    setLocalFiles(updatedFiles)
    setPreviews(updatedPreviews)
    setValue('photos', updatedFiles, { shouldDirty: true })
    if (inputRef.current) inputRef.current.value = ''
  }

  function removeFile(index: number) {
    URL.revokeObjectURL(previews[index])
    const updatedFiles = localFiles.filter((_, i) => i !== index)
    const updatedPreviews = previews.filter((_, i) => i !== index)
    setLocalFiles(updatedFiles)
    setPreviews(updatedPreviews)
    setValue('photos', updatedFiles, { shouldDirty: true })
  }

  return (
    <div>
      {hasPhotos && (
        <div className="flex flex-wrap gap-3 mb-4">
          {previews.map((url, i) => (
            <div key={url} className="relative w-[80px] h-[80px] rounded-[14px] overflow-hidden flex-none">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="absolute top-1 right-1 w-[22px] h-[22px] rounded-full grid place-items-center"
                style={{ background: 'rgba(20,8,30,.7)', color: '#fff' }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {!atLimit && (
        <div
          className={[
            'relative overflow-hidden rounded-[20px] min-h-[180px] flex flex-col items-center justify-center gap-2 text-center',
            'cursor-pointer transition-transform duration-150 border-2 border-dashed',
            dragging ? '-translate-y-0.5 border-[var(--pink)]' : 'border-[#f0b9d2]',
          ].join(' ')}
          style={{ background: 'linear-gradient(135deg,#FFF6FA,#FBF4FF)' }}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragEnter={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            addFiles(e.dataTransfer.files)
          }}
        >
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
            {hasPhotos ? 'Adicionar mais fotos' : 'Adicione a imagem de capa'}
          </strong>
          <span className="font-semibold text-[14px]" style={{ color: 'var(--ink-soft)' }}>
            Arraste e solte ou clique para enviar
          </span>
          <span className="font-medium text-[13px]" style={{ color: 'var(--wp-muted)' }}>
            {hasPhotos
              ? `${localFiles.length}/${MAX_PHOTOS} fotos selecionadas`
              : 'É a primeira coisa que o público vê no feed — escolha uma foto que chame atenção 🔥'}
          </span>
        </div>
      )}

      {atLimit && (
        <div
          className="flex items-center justify-center gap-2 rounded-[16px] px-4 py-3 text-[13px] font-semibold"
          style={{ background: '#FFF4E5', color: 'var(--amber)', border: '1.5px solid #FFD9A0' }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" />
          </svg>
          Limite de {MAX_PHOTOS} fotos atingido
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(e) => addFiles(e.target.files)}
      />
    </div>
  )
}
