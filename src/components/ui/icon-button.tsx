import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/** Icon button do visual B (Figma: Icon button › Tom). `aria-label` é obrigatório. */
const iconButtonVariants = cva(
  "inline-flex size-9 shrink-0 items-center justify-center rounded-[10px] transition-colors outline-none focus-visible:ring-3 focus-visible:ring-wp-magenta/30 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-[18px]",
  {
    variants: {
      tone: {
        neutral: "bg-neutral-100 text-wp-sub hover:bg-neutral-200",
        view: "bg-tint-purple text-wp-purple hover:bg-tint-purple/70",
        danger: "bg-tint-pink text-wp-magenta hover:bg-tint-pink/70",
        success: "bg-tint-green text-wp-green hover:bg-tint-green/70",
      },
    },
    defaultVariants: { tone: "neutral" },
  }
)

type IconButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof iconButtonVariants> & { "aria-label": string }

function IconButton({ className, tone, type = "button", ...props }: IconButtonProps) {
  return (
    <button
      type={type}
      data-slot="icon-button"
      className={cn(iconButtonVariants({ tone }), className)}
      {...props}
    />
  )
}

export { IconButton, iconButtonVariants }
