"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type TabItem<T extends string = string> = {
  value: T
  label: React.ReactNode
  /** Contador opcional ao lado do rótulo (ex.: "Todos · 6"). */
  count?: number | string
  testId?: string
}

type TabsProps<T extends string> = {
  items: TabItem<T>[]
  value: T
  onValueChange: (value: T) => void
  className?: string
  "aria-label"?: string
}

function useTabKeys<T extends string>(items: TabItem<T>[], value: T, onValueChange: (v: T) => void) {
  return (e: React.KeyboardEvent) => {
    const i = items.findIndex((it) => it.value === value)
    if (e.key === "ArrowRight") onValueChange(items[(i + 1) % items.length].value)
    if (e.key === "ArrowLeft") onValueChange(items[(i - 1 + items.length) % items.length].value)
  }
}

/** Abas com sublinhado (Figma: Tab › Style=Underline). Ativa: 3px #FF5F8F, texto magenta. */
function UnderlineTabs<T extends string>({ items, value, onValueChange, className, ...rest }: TabsProps<T>) {
  const onKeyDown = useTabKeys(items, value, onValueChange)
  return (
    <div
      role="tablist"
      aria-label={rest["aria-label"]}
      onKeyDown={onKeyDown}
      className={cn("flex gap-1 overflow-x-auto border-b border-wp-line", className)}
    >
      {items.map((it) => {
        const active = it.value === value
        return (
          <button
            key={it.value}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            data-testid={it.testId}
            onClick={() => onValueChange(it.value)}
            className={cn(
              "-mb-px whitespace-nowrap border-b-[3px] px-5 py-3 text-sm font-semibold transition-colors outline-none focus-visible:bg-tint-pink/50",
              active
                ? "border-wp-primary text-wp-magenta"
                : "border-transparent text-neutral-600 hover:text-ink"
            )}
          >
            {it.label}
            {it.count !== undefined ? <span className="ml-1 opacity-70">· {it.count}</span> : null}
          </button>
        )
      })}
    </div>
  )
}

/** Alternância curta em pílulas (Figma: Tab › Style=Pill): período, visibilidade, filtros. */
function PillTabs<T extends string>({ items, value, onValueChange, className, ...rest }: TabsProps<T>) {
  const onKeyDown = useTabKeys(items, value, onValueChange)
  return (
    <div
      role="tablist"
      aria-label={rest["aria-label"]}
      onKeyDown={onKeyDown}
      className={cn("inline-flex gap-1 rounded-xl bg-wp-bg p-1", className)}
    >
      {items.map((it) => {
        const active = it.value === value
        return (
          <button
            key={it.value}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            data-testid={it.testId}
            onClick={() => onValueChange(it.value)}
            className={cn(
              "rounded-[10px] px-4 py-1.5 text-sm font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-wp-primary/30",
              active ? "bg-tint-pink text-wp-magenta" : "text-neutral-600 hover:text-ink"
            )}
          >
            {it.label}
          </button>
        )
      })}
    </div>
  )
}

export { UnderlineTabs, PillTabs }
