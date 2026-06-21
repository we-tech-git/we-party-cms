import { CmsSidebar } from '@/components/cms/sidebar'
import { CmsTopbar } from '@/components/cms/topbar'

export default function CmsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <CmsTopbar />

      {/* Shell com max-width e grid sidebar + conteúdo */}
      <div className="flex-1 w-full max-w-375 mx-auto flex flex-col">
        <div
          className="flex-1 grid items-start grid-cols-[64px_minmax(0,1fr)] lg:grid-cols-[230px_minmax(0,1fr)]"
        >
          <CmsSidebar />
          <main className="min-w-0 px-[clamp(14px,3vw,34px)] py-6 pb-16">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
