'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/stores/auth.store'
import { loginUser } from '@/services/auth.service'

const loginSchema = z.object({
  email: z.string().min(1, 'E-mail obrigatório').email('E-mail inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const saveAuthData = useAuthStore((s) => s.saveAuthData)
  const [rememberMe, setRememberMe] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  useEffect(() => {
    const savedEmail = localStorage.getItem('REMEMBERED_EMAIL')
    if (savedEmail) {
      setValue('email', savedEmail)
      setRememberMe(true)
    }
  }, [setValue])

  function showToast(message: string, type: 'success' | 'error' | 'warning') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const { mutate, isPending } = useMutation({
    mutationFn: loginUser,
    onSuccess(data) {
      if (data?.success && data?.data?.token) {
        saveAuthData(data)

        if (rememberMe) {
          localStorage.setItem('REMEMBERED_EMAIL', data.data.email)
        } else {
          localStorage.removeItem('REMEMBERED_EMAIL')
        }

        showToast('Login realizado com sucesso!', 'success')
        setTimeout(() => router.push('/cms/home'), 1200)
      } else {
        showToast('Credenciais inválidas. Tente novamente.', 'error')
      }
    },
    onError(error: any) {
      const message =
        error?.response?.data?.message ?? 'Erro ao fazer login. Verifique suas credenciais.'

      if (message.toLowerCase().includes('email não verificado')) {
        showToast(message, 'warning')
        const email = error?.config?.data
          ? JSON.parse(error.config.data).email
          : ''
        localStorage.setItem('NEW_CREATED_USER', JSON.stringify(email))
      } else {
        showToast(message, 'error')
      }
    },
  })

  function onSubmit(values: LoginFormData) {
    mutate(values)
  }

  const toastColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-orange-400',
  }

  return (
    <>
      {/* Título mobile */}
      <h2
        className="mb-3 block text-center text-4xl font-extrabold uppercase md:hidden"
        style={{
          fontFamily: "'Baloo Thambi 2', cursive",
          background: 'linear-gradient(to right, #FFC947, #F978A3)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        WE PARTY
      </h2>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Entrar</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            E-mail
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            {...register('email')}
            className={`h-12 rounded-xl border px-4 text-[#072961] shadow-sm transition-all focus:ring-2 focus:ring-[#F978A3]/30 ${
              errors.email ? 'border-red-400' : 'border-[#F0F0F0] focus:border-[#F978A3]'
            }`}
          />
          {errors.email && (
            <span className="text-sm text-red-500">{errors.email.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password" className="text-sm font-medium text-gray-700">
            Senha
          </Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            {...register('password')}
            className={`h-12 rounded-xl border px-4 text-[#072961] shadow-sm transition-all focus:ring-2 focus:ring-[#F978A3]/30 ${
              errors.password ? 'border-red-400' : 'border-[#F0F0F0] focus:border-[#F978A3]'
            }`}
          />
          {errors.password && (
            <span className="text-sm text-red-500">{errors.password.message}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            id="rememberMe"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="accent-[#F978A3]"
          />
          <label htmlFor="rememberMe" className="text-sm text-gray-500">
            Lembrar-me
          </label>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="mt-2 h-12 w-full rounded-xl bg-gradient-to-r from-[#FFC947] to-[#F978A3] text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Entrando...
            </span>
          ) : (
            'Entrar'
          )}
        </Button>
      </form>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 rounded-lg px-5 py-3 text-sm text-white shadow-lg transition-all ${toastColors[toast.type]}`}
        >
          {toast.message}
        </div>
      )}
    </>
  )
}
