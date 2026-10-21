"use client"

import * as React from "react"
import { CheckCircle2, CircleAlert, TriangleAlert } from "lucide-react"

import { cn } from "@/lib/utils"

export type ToastType = "success" | "error" | "warning"
type ToastState = { message: string; type: ToastType } | null

const STYLES: Record<ToastType, string> = {
  success: "bg-wp-green text-white",
  error: "bg-wp-danger text-white",
  warning: "bg-wp-orange text-white",
}
const ICONS = { success: CheckCircle2, error: CircleAlert, warning: TriangleAlert }

/** Toast presentacional. `error`/`warning` usam role=alert (anunciado na hora), `success` usa role=status. */
function Toast({ message, type, className }: { message: string; type: ToastType; className?: string }) {
  const Icon = ICONS[type]
  return (
    <div
      role={type === "success" ? "status" : "alert"}
      data-testid={`toast-${type}`}
      className={cn(
        "fixed bottom-6 left-1/2 z-100 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-2.5 rounded-xl px-5 py-3 text-sm font-medium shadow-dark",
        STYLES[type],
        className
      )}
    >
      <Icon className="size-[18px] shrink-0" aria-hidden />
      {message}
    </div>
  )
}

/** Hook: `const { toastNode, showToast } = useToast()` e renderize `{toastNode}` na página. */
function useToast(durationMs = 4000) {
  const [toast, setToast] = React.useState<ToastState>(null)
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = React.useCallback(
    (message: string, type: ToastType = "success") => {
      if (timer.current) clearTimeout(timer.current)
      setToast({ message, type })
      timer.current = setTimeout(() => setToast(null), durationMs)
    },
    [durationMs]
  )

  React.useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  const toastNode = toast ? <Toast message={toast.message} type={toast.type} /> : null
  return { toastNode, showToast }
}

export { Toast, useToast }
