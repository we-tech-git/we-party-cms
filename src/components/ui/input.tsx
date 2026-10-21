import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

/**
 * Input do visual B (Figma: Design System › Input).
 * Branco, borda quente `wp-line`, raio 14, 48px. Erro = `aria-invalid`.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-12 w-full min-w-0 rounded-ctl border border-wp-line bg-white px-4 text-base text-wp-body transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-wp-faint focus-visible:border-wp-primary focus-visible:ring-3 focus-visible:ring-wp-primary/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-wp-faint aria-invalid:border-wp-danger aria-invalid:ring-3 aria-invalid:ring-wp-danger/15",
        className
      )}
      {...props}
    />
  )
}

export { Input }
