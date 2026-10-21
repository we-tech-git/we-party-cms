"use client"

import * as React from "react"
import { Eye, EyeOff } from "lucide-react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type PasswordInputProps = Omit<React.ComponentProps<"input">, "type"> & {
  showLabel?: string
  hideLabel?: string
}

/**
 * Campo de senha com botão de olho (Figma: Login › campo Senha).
 * O botão tem aria-pressed e rótulo acessível; a senha volta a ficar oculta ao desmontar.
 */
function PasswordInput({
  className,
  showLabel = "Mostrar senha",
  hideLabel = "Ocultar senha",
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = React.useState(false)
  return (
    <div className="relative">
      <Input type={visible ? "text" : "password"} className={cn("pr-12", className)} {...props} />
      <button
        type="button"
        data-testid="toggle-password"
        aria-label={visible ? hideLabel : showLabel}
        aria-pressed={visible}
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-0 right-3 my-auto grid size-8 place-items-center rounded-lg text-wp-sub transition-colors outline-none hover:text-ink focus-visible:ring-3 focus-visible:ring-wp-primary/30"
      >
        {visible ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
      </button>
    </div>
  )
}

export { PasswordInput }
