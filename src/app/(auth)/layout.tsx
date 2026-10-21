import { AuthShell } from '@/components/cms/auth-shell'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthShell>{children}</AuthShell>
}
