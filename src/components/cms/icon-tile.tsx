import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/** Tile quadrado com ícone (Figma: Icon tile / Stat card / Panel header). `brand` = gradiente (único destaque). */
const iconTileVariants = cva("grid shrink-0 place-items-center", {
  variants: {
    tone: {
      pink: "bg-tint-pink text-wp-magenta",
      orange: "bg-tint-orange text-wp-orange",
      purple: "bg-tint-purple text-wp-purple",
      green: "bg-tint-green text-wp-green",
      brand: "bg-(image:--wp-gradient) text-white",
      neutral: "bg-neutral-100 text-wp-sub",
    },
    size: {
      sm: "size-8 rounded-[10px] [&_svg]:size-[18px]",
      md: "size-11 rounded-xl [&_svg]:size-[22px]",
      lg: "size-[52px] rounded-2xl [&_svg]:size-[26px]",
    },
  },
  defaultVariants: { tone: "purple", size: "sm" },
})

function IconTile({
  tone,
  size,
  className,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof iconTileVariants>) {
  return <span aria-hidden data-slot="icon-tile" className={cn(iconTileVariants({ tone, size }), className)} {...props} />
}

export { IconTile }
