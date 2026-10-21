import * as React from "react"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

type CheckboxProps = Omit<React.ComponentProps<"input">, "type"> & {
  /** Rótulo ao lado da caixa. Aceita nós (ex.: links dos termos). */
  label?: React.ReactNode
}

/**
 * Checkbox do visual B (Figma: Checkbox › Marcado Sim/Não).
 * Usa o `<input type="checkbox">` nativo (teclado/leitor de tela) e desenha a caixa por cima.
 */
function Checkbox({ className, label, id, ...props }: CheckboxProps) {
  const autoId = React.useId()
  const inputId = id ?? autoId
  return (
    <label
      htmlFor={inputId}
      className={cn("inline-flex cursor-pointer items-center gap-2.5 text-sm text-neutral-600 select-none", className)}
    >
      <input id={inputId} type="checkbox" data-slot="checkbox" className="peer sr-only" {...props} />
      <span
        aria-hidden
        className="grid size-5 shrink-0 place-items-center rounded-md border-[1.5px] border-neutral-200 bg-white text-transparent transition-colors peer-checked:border-wp-primary peer-checked:bg-wp-primary peer-checked:text-white peer-focus-visible:ring-3 peer-focus-visible:ring-wp-primary/30 peer-disabled:opacity-50"
      >
        <Check className="size-3.5" strokeWidth={3} />
      </span>
      {label ? <span>{label}</span> : null}
    </label>
  )
}

export { Checkbox }
