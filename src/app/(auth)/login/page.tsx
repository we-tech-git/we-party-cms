'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/ui/password-input'
import { SocialButton } from '@/components/ui/social-button'
import { useToast } from '@/components/ui/toast'
import { useGoogleCode } from '@/hooks/use-google-code'
import { useI18n } from '@/i18n/context'
import { useAuthStore } from '@/stores/auth.store'
import { loginUser, loginWithGoogle } from '@/services/auth.service'
import type { LoginResponse } from '@/types/auth.types'

type LoginFormData = { email: string; password: string }

const REMEMBERED_EMAIL_KEY = 'REMEMBERED_EMAIL'

export default function LoginPage() {
  const { t } = useI18n()
  const router = useRouter()
  const saveAuthData = useAuthStore((s) => s.saveAuthData)
  const { toastNode, showToast } = useToast()
  const [rememberMe, setRememberMe] = useState(false)

  const loginSchema = z.object({
    email: z.string().min(1, t('login.errors.emailRequired')).email(t('login.errors.emailInvalid')),
    password: z.string().min(1, t('login.errors.passwordRequired')),
  })

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

  useEffect(() => {
    const savedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY)
    if (savedEmail) {
      setValue('email', savedEmail)
      // Hidrata o "lembrar-me" uma única vez após montar (evita mismatch de SSR).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRememberMe(true)
    }
  }, [setValue])

  function handleSuccess(data: LoginResponse, remember: boolean) {
    if (!data?.success || !data?.data?.token) {
      showToast(t('login.invalidCredentials'), 'error')
      return
    }
    saveAuthData(data)
    // Só o e-mail é lembrado (nunca a senha/token) e apenas se o usuário marcou a opção.
    if (remember) localStorage.setItem(REMEMBERED_EMAIL_KEY, data.data.email)
    else localStorage.removeItem(REMEMBERED_EMAIL_KEY)
    showToast(t('login.success'), 'success')
    setTimeout(() => router.push('/cms/home'), 800)
  }

  const { mutate, isPending } = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => handleSuccess(data, rememberMe),
    onError(error: unknown, variables) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        t('login.genericError')
      if (message.toLowerCase().includes('email não verificado')) {
        showToast(message, 'warning')
        localStorage.setItem('NEW_CREATED_USER', JSON.stringify(variables.email))
      } else {
        showToast(message, 'error')
      }
    },
  })

  const google = useMutation({
    mutationFn: loginWithGoogle,
    onSuccess: (data) => handleSuccess(data, false),
    onError: () => showToast(t('login.googleFailed'), 'error'),
  })

  const googleCode = useGoogleCode(
    (code) => google.mutate(code),
    () => showToast(t('login.googleFailed'), 'error'),
  )

  const busy = isPending || google.isPending

  return (
    <>
      <div className="mb-6">
        <h1 className="text-[32px] leading-tight font-bold text-ink" data-testid="login-title">
          {t('login.title')}
        </h1>
        <p className="mt-1 text-sm text-wp-sub">{t('login.subtitle')}</p>
      </div>

      <form
        onSubmit={handleSubmit((values) => mutate(values))}
        noValidate
        className="flex flex-col gap-5"
        data-testid="login-form"
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email" className="text-sm font-medium text-neutral-700">
            {t('login.email')}
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder={t('login.emailPlaceholder')}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            data-testid="login-email"
            {...register('email')}
          />
          {errors.email && (
            <span id="email-error" role="alert" className="text-sm text-wp-danger" data-testid="login-email-error">
              {errors.email.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password" className="text-sm font-medium text-neutral-700">
            {t('login.password')}
          </Label>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder={t('login.passwordPlaceholder')}
            showLabel={t('login.showPassword')}
            hideLabel={t('login.hidePassword')}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
            data-testid="login-password"
            {...register('password')}
          />
          {errors.password && (
            <span id="password-error" role="alert" className="text-sm text-wp-danger" data-testid="login-password-error">
              {errors.password.message}
            </span>
          )}
        </div>

        <Checkbox
          label={t('login.remember')}
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          data-testid="login-remember"
        />

        <Button type="submit" variant="primary" size="md" disabled={busy} className="w-full" data-testid="login-submit">
          {isPending ? (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />
              {t('login.submitting')}
            </>
          ) : (
            t('login.submit')
          )}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-[13px] text-wp-sub" role="separator">
        <span className="h-px flex-1 bg-wp-line" />
        {t('login.orWith')}
        <span className="h-px flex-1 bg-wp-line" />
      </div>

      <SocialButton
        disabled={busy || (googleCode.enabled && !googleCode.ready)}
        onClick={() =>
          googleCode.enabled ? googleCode.requestCode() : showToast(t('login.googleUnavailable'), 'warning')
        }
        data-testid="login-google"
      >
        {t('login.google')}
      </SocialButton>

      {toastNode}
    </>
  )
}
