import { CalendarCheck, Ticket, Users } from "lucide-react"

import { IconTile } from "@/components/cms/icon-tile"
import { Logo } from "@/components/cms/logo"
import { cn } from "@/lib/utils"

type BrandPanelProps = {
  title: string
  highlight: string
  bullets: [string, string, string]
  className?: string
}

/**
 * Painel da marca das telas de acesso (Figma: Brand panel).
 * Tinta #221A3D, logo em gradiente, título com destaque em gradiente e 3 benefícios. Sem confete.
 */
function BrandPanel({ title, highlight, bullets, className }: BrandPanelProps) {
  const icons = [CalendarCheck, Users, Ticket]
  const tones = ["orange", "pink", "purple"] as const
  return (
    <aside
      data-testid="brand-panel"
      className={cn("flex flex-col justify-center gap-8 bg-ink px-16 py-20 text-white", className)}
    >
      <Logo className="text-[64px] leading-none" />
      <h2 className="max-w-[560px] text-[44px] leading-[1.15] font-bold">
        {title}{" "}
        <span className="bg-(image:--wp-gradient) bg-clip-text text-transparent">{highlight}</span>
      </h2>
      <ul className="flex flex-col gap-3.5">
        {bullets.map((text, i) => {
          const Icon = icons[i]
          return (
            <li key={text} className="flex items-center gap-3.5 text-base font-medium">
              <IconTile tone={tones[i]} size="md" className="bg-white/10">
                <Icon />
              </IconTile>
              {text}
            </li>
          )
        })}
      </ul>
    </aside>
  )
}

export { BrandPanel }
