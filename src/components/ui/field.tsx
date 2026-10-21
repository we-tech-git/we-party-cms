import * as React from "react"

import { cn } from "@/lib/utils"

type FieldProps = {
  label: React.ReactNode
  /** id do controle (liga o <label> ao campo). */
  htmlFor?: string
  required?: boolean
  error?: string
  hint?: React.ReactNode
  className?: string
  children: React.ReactNode
}

/** Rótulo + controle + erro/dica (Figma: Input › Rótulo, State=Error). O erro é anunciado (`role=alert`). */
function Field({ label, htmlFor, required, error, hint, className, children }: FieldProps) {
  return (
    <div data-slot="field" className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-[13px] font-semibold text-neutral-700">
        {label} {required ? <span className="text-wp-magenta" aria-hidden>*</span> : null}
      </label>
      {children}
      {error ? (
        <span role="alert" className="text-xs font-medium text-wp-danger">{error}</span>
      ) : hint ? (
        <span className="text-xs text-wp-sub">{hint}</span>
      ) : null}
    </div>
  )
}

export { Field }
