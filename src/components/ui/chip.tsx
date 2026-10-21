import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/** Chip do visual B (Figma: Chip › Type). `glass` é só para uso sobre imagem/capa. */
const chipVariants = cva(
  "inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold [&_svg]:size-3.5",
  {
    variants: {
      tone: {
        neutral: "border border-wp-line bg-white text-ink",
        pink: "bg-tint-pink text-wp-magenta",
        orange: "bg-tint-orange text-wp-orange",
        purple: "bg-tint-purple text-wp-purple",
        green: "bg-tint-green text-wp-green",
        selected: "bg-wp-magenta text-white",
        glass: "border border-white/30 bg-white/15 text-white backdrop-blur-sm",
      },
    },
    defaultVariants: { tone: "neutral" },
  }
)

function Chip({
  className,
  tone,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof chipVariants>) {
  return <span data-slot="chip" className={cn(chipVariants({ tone }), className)} {...props} />
}

export { Chip, chipVariants }
