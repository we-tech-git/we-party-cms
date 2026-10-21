import { CmsBottomNav } from '@/components/cms/bottom-nav'
import { CmsSidebar } from '@/components/cms/sidebar'
import { CmsTopbar } from '@/components/cms/topbar'

/** Casca do CMS (Figma: CMS Desktop/Mobile). Topo branco; menu lateral no desktop e barra inferior no mobile. */
export default function CmsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-wp-bg">
      <CmsTopbar />
      <div className="mx-auto flex w-full max-w-375 flex-1 items-start gap-6 px-4 py-4 pb-24 sm:px-8 lg:pb-8">
        <CmsSidebar />
        <main className="min-w-0 flex-1 pt-2">{children}</main>
      </div>
      <CmsBottomNav />
    </div>
  )
}
