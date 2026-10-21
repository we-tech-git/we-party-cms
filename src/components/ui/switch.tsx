"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type SwitchProps = Omit<React.ComponentProps<"button">, "onChange"> & {
  checked: boolean
  onCheckedChange?: (checked: boolean) => void
}

/** Switch do visual B (Figma: Switch › Ligado Sim/Não). Ligado = gradiente da marca. */
function Switch({ checked, onCheckedChange, className, disabled, ...props }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      data-slot="switch"
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        "relative h-[26px] w-11 shrink-0 rounded-full transition-colors outline-none focus-visible:ring-3 focus-visible:ring-wp-primary/30 disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-(image:--wp-gradient)" : "bg-neutral-200",
        className
      )}
      {...props}
    >
      <span
        aria-hidden
        className={cn(
          "absolute top-[3px] size-5 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,.18)] transition-[left]",
          checked ? "left-[21px]" : "left-[3px]"
        )}
      />
    </button>
  )
}

export { Switch }
