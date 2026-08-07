'use client'

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth.store'
import { useUpdateProfileImage } from '@/hooks/use-update-profile-image'
import { useI18n } from '@/i18n/context'
import { GRAD, SHADOW_SM } from '@/lib/brand'
import { LanguageSwitcher } from './language-switcher'

/** Square avatar: shows the user's photo, falling back to their initial. */
function AvatarBox({
  photo,
  alt,
  initial,
  size,
  radius,
}: {
  photo: string | null
  alt: string
  initial: string
  size: number
  radius: number
}) {
  return (
    <span
      className="grid place-items-center text-white font-extrabold overflow-hidden flex-none"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: photo ? '#fff' : 'linear-gradient(135deg,#7b5cff,#c54bff)',
        fontFamily: 'var(--font-bricolage)',
      }}
    >
      {photo ? (
        <img src={photo} alt={alt} className="w-full h-full object-cover" />
      ) : (
        initial
      )}
    </span>
  )
}

export function CmsTopbar() {
  const { t } = useI18n()
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const initial = (user?.name ?? 'U')[0].toUpperCase()

  const [menuOpen, setMenuOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const objectUrlRef = useRef<string | null>(null)

  const uploadImage = useUpdateProfileImage()

  // The photo currently shown: local preview > stored profileImage > none (fallback to initial).
  const photo = preview ?? user?.profileImage ?? null

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    if (menuOpen) document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [menuOpen])

  // Lock body scroll while the avatar modal is open.
  useEffect(() => {
    if (typeof document === 'undefined') return
    if (modalOpen) document.body.style.overflow = 'hidden'
    else document.body.style.removeProperty('overflow')
    return () => {
      document.body.style.removeProperty('overflow')
    }
  }, [modalOpen])

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    }
  }, [])

  function handleLogout() {
    logout()
    router.push('/login')
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !file.type.startsWith('image/')) return

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    const url = URL.createObjectURL(file)
    objectUrlRef.current = url
    setPreview(url)
    setModalOpen(false)

    uploadImage.mutate(file)
  }

  const avatarAlt = t('topbar.avatarAlt', { name: user?.name ?? '' })

  return (
    <header
      className="sticky top-0 z-60 flex items-center gap-3 sm:gap-4.5 px-[clamp(14px,3vw,34px)] py-3.5"
      style={{
        background: 'rgba(255,244,247,.78)',
        backdropFilter: 'blur(18px)',
        borderBottom: '1px solid rgba(34,26,61,.06)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2 sm:gap-2.75 min-w-0"
        style={{ fontFamily: 'var(--font-bricolage)', fontWeight: 800, fontSize: 21, letterSpacing: '.02em' }}
      >
        <img
          src="/logoweparty.png"
          alt="WeParty"
          className="w-9 h-9 rounded-[11px] object-contain flex-none"
          style={{ boxShadow: SHADOW_SM }}
        />
        <span>WE&nbsp;</span>
        <span style={{ background: GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
          PARTY
        </span>
        <span className="hidden md:block w-px h-6.5 mx-1" style={{ background: 'rgba(34,26,61,.08)' }} />
        <span
          className="hidden md:inline text-[16px] truncate"
          style={{ fontWeight: 700, background: 'linear-gradient(120deg,#7C5CFF,#D81B7E)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}
        >
          {t('topbar.producerSpace')}
        </span>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <LanguageSwitcher />

        {/* User avatar + menu */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-1.5 p-1 pr-2 rounded-[14px] border-2 border-white transition-shadow hover:shadow-md"
            style={{ background: 'rgba(255,255,255,.6)', boxShadow: SHADOW_SM }}
            aria-label={t('topbar.userMenu')}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <AvatarBox photo={photo} alt={avatarAlt} initial={initial} size={36} radius={11} />
            <svg
              className="hidden sm:block transition-transform"
              style={{ transform: menuOpen ? 'rotate(180deg)' : undefined }}
              width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8C85A2" strokeWidth="2.4"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-13 z-70 min-w-64 rounded-[16px] p-2 bg-white"
              style={{ border: '1px solid rgba(34,26,61,.08)', boxShadow: 'var(--shadow)' }}
            >
              {/* Header */}
              <div
                className="flex items-center gap-2.5 p-2.5 rounded-[12px] mb-1"
                style={{ background: 'linear-gradient(135deg,rgba(124,92,255,.07),rgba(216,27,126,.07))' }}
              >
                <AvatarBox photo={photo} alt={avatarAlt} initial={initial} size={44} radius={12} />
                <div className="min-w-0">
                  <p className="font-bold text-[14px] truncate">{user?.name ?? t('home.producer')}</p>
                  <p className="text-[12px] font-medium truncate" style={{ color: 'var(--wp-muted)' }}>
                    {user?.email ?? ''}
                  </p>
                </div>
              </div>

              <button
                type="button"
                role="menuitem"
                disabled
                title={`${t('topbar.myProfile')} — ${t('common.comingSoon')}`}
                className="w-full flex items-center gap-2.75 px-2.75 py-2.5 rounded-[10px] font-bold text-[14px] text-left opacity-40 cursor-not-allowed"
                style={{ color: 'var(--ink-soft)' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
                {t('topbar.myProfile')}
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false)
                  setModalOpen(true)
                }}
                className="w-full flex items-center gap-2.75 px-2.75 py-2.5 rounded-[10px] font-bold text-[14px] text-left transition-colors hover:bg-[#FBF4FA]"
                style={{ color: 'var(--ink-soft)' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.1-3.1a2 2 0 00-2.8 0L6 21" />
                </svg>
                {t('topbar.changePhoto')}
              </button>

              <div className="h-px my-1.5 mx-1" style={{ background: 'var(--line-2)' }} />

              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.75 px-2.75 py-2.5 rounded-[10px] font-bold text-[14px] text-left transition-colors hover:bg-[#FFF0F3]"
                style={{ color: 'var(--red,#E0476B)' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><path d="M16 17l5-5-5-5M21 12H9" />
                </svg>
                {t('topbar.logout')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />

      {/* Avatar modal — portaled to <body> so `fixed` is relative to the
          viewport, not this header (which has backdrop-filter and would
          otherwise become the containing block for fixed descendants). */}
      {modalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(17,24,39,.6)', backdropFilter: 'blur(4px)' }}
            onClick={() => setModalOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative z-1 w-[min(92vw,420px)] rounded-[24px] bg-white p-7 flex flex-col gap-5"
            style={{ boxShadow: 'var(--shadow)' }}
          >
            <button
              type="button"
              aria-label={t('myEvents.deleteModal.cancel')}
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-[8px] grid place-items-center transition-colors hover:bg-[#FFF0F3]"
              style={{ background: 'rgba(107,114,128,.1)', color: '#6b7280' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            <h2 className="font-extrabold text-[22px]" style={{ fontFamily: 'var(--font-bricolage)' }}>
              {t('topbar.avatarModalTitle')}
            </h2>
            <p className="text-[14px] font-medium leading-relaxed -mt-3" style={{ color: 'var(--ink-soft)' }}>
              {t('topbar.avatarModalDescription')}
            </p>

            <div
              className="self-center w-35 h-35 rounded-full grid place-items-center overflow-hidden p-1"
              style={{ background: 'linear-gradient(135deg,rgba(124,92,255,.18),rgba(216,27,126,.18))' }}
            >
              {photo ? (
                <img src={photo} alt={t('topbar.avatarAlt', { name: user?.name ?? '' })} className="w-full h-full object-cover rounded-full" />
              ) : (
                <span className="w-full h-full rounded-full grid place-items-center text-white text-[44px] font-extrabold" style={{ background: 'linear-gradient(135deg,#7b5cff,#c54bff)', fontFamily: 'var(--font-bricolage)' }}>
                  {initial}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                disabled={uploadImage.isPending}
                onClick={() => fileRef.current?.click()}
                className="rounded-[12px] py-3.5 font-extrabold text-[15px] text-white transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0"
                style={{ background: GRAD, boxShadow: '0 8px 24px -8px rgba(216,27,126,.5)' }}
              >
                {uploadImage.isPending ? t('topbar.avatarUploading') : t('topbar.avatarModalUpload')}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </header>
  )
}
