'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Upload, X, TriangleAlert } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import { IconTile } from '@/components/cms/icon-tile'
import { cn } from '@/lib/utils'
import type { CreateEventForm } from '../_schema'
import { MAX_PHOTOS } from '../_schema'

/**
 * Tipos aceitos como capa. SVG fica de fora de propósito: SVG executa script (checklist de segurança, AGENTS.md).
 * Validação de cliente é só UX — o backend precisa validar tipo/tamanho/conteúdo também.
 */
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024

export function CoverDropzone() {
  const { setValue, getValues } = useFormContext<CreateEventForm>()
  const [existing, setExisting] = useState<string[]>(() => getValues('existingPhotoUrls') ?? [])
  const [localFiles, setLocalFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [dragging, setDragging] = useState(false)
  const [rejected, setRejected] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const totalCount = existing.length + localFiles.length
  const hasPhotos = totalCount > 0
  const atLimit = totalCount >= MAX_PHOTOS

  function addFiles(incoming: FileList | null) {
    if (!incoming) return
    const all = Array.from(incoming)
    const valid = all.filter((f) => ALLOWED_IMAGE_TYPES.includes(f.type) && f.size <= MAX_IMAGE_BYTES)
    setRejected(valid.length < all.length ? 'Alguns arquivos foram ignorados: use JPG, PNG, WebP, GIF ou AVIF de até 5 MB.' : null)
    if (!valid.length) return
    const toAdd = valid.slice(0, MAX_PHOTOS - totalCount)
    if (!toAdd.length) return
    const newPreviews = toAdd.map((f) => URL.createObjectURL(f))
    const updatedFiles = [...localFiles, ...toAdd]
    setLocalFiles(updatedFiles)
    setPreviews([...previews, ...newPreviews])
    setValue('photos', updatedFiles, { shouldDirty: true })
    if (inputRef.current) inputRef.current.value = ''
  }

  function removeExisting(index: number) {
    const updated = existing.filter((_, i) => i !== index)
    setExisting(updated)
    setValue('existingPhotoUrls', updated, { shouldDirty: true })
  }

  function removeFile(index: number) {
    URL.revokeObjectURL(previews[index])
    const updatedFiles = localFiles.filter((_, i) => i !== index)
    setLocalFiles(updatedFiles)
    setPreviews(previews.filter((_, i) => i !== index))
    setValue('photos', updatedFiles, { shouldDirty: true })
  }

  const thumbs = [
    ...existing.map((url, i) => ({ url, remove: () => removeExisting(i) })),
    ...previews.map((url, i) => ({ url, remove: () => removeFile(i) })),
  ]

  return (
    <div data-testid="cover-dropzone" className="flex flex-col gap-3">
      {hasPhotos && (
        <ul className="flex flex-wrap gap-3">
          {thumbs.map((th) => (
            <li key={th.url} className="relative size-20 shrink-0 overflow-hidden rounded-[14px] border border-wp-line">
              <Image src={th.url} alt="" fill className="object-cover" unoptimized />
              <button
                type="button"
                aria-label="Remover foto"
                onClick={th.remove}
                className="absolute top-1 right-1 grid size-5.5 place-items-center rounded-full bg-ink/80 text-white outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <X className="size-3" strokeWidth={3} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {!atLimit && (
        <div
          role="button"
          tabIndex={0}
          aria-label={hasPhotos ? 'Adicionar mais fotos' : 'Adicionar imagem de capa'}
          data-testid="cover-drop-area"
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), inputRef.current?.click())}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragEnter={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }}
          className={cn(
            'flex min-h-40 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-panel border-[1.5px] border-dashed bg-white text-center outline-none transition-colors focus-visible:ring-3 focus-visible:ring-wp-primary/30',
            dragging ? 'border-wp-magenta bg-tint-pink/40' : 'border-[#f6b8d0]'
          )}
        >
          <IconTile tone="pink" size="md" className="mb-1.5"><Upload /></IconTile>
          <strong className="text-base font-semibold text-ink">{hasPhotos ? 'Adicionar mais fotos' : 'Adicione a imagem de capa'}</strong>
          <span className="text-[13px] text-wp-sub">Arraste e solte ou clique para enviar</span>
          <span className="px-4 text-xs text-wp-faint">
            {hasPhotos ? `${totalCount}/${MAX_PHOTOS} fotos selecionadas` : 'É a primeira coisa que o público vê no feed — escolha uma foto que chame atenção'}
          </span>
        </div>
      )}

      {atLimit && (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-wp-orange/30 bg-tint-orange px-4 py-3 text-[13px] font-semibold text-wp-orange">
          <TriangleAlert className="size-4" /> Limite de {MAX_PHOTOS} fotos atingido
        </div>
      )}

      {rejected && <p role="alert" className="text-xs font-medium text-wp-danger" data-testid="cover-rejected">{rejected}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(',')}
        multiple
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => addFiles(e.target.files)}
      />
    </div>
  )
}
