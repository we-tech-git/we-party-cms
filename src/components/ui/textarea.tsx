import * as React from "react"

import { cn } from "@/lib/utils"

/** Textarea do visual B: mesmo visual do Input, com contador opcional (`maxLength` + `showCount`). */
function Textarea({
  className,
  showCount,
  maxLength,
  value,
  ...props
}: React.ComponentProps<"textarea"> & { showCount?: boolean }) {
  const length = typeof value === "string" ? value.length : 0
  return (
    <div className="flex flex-col gap-1.5">
      <textarea
        data-slot="textarea"
        value={value}
        maxLength={maxLength}
        className={cn(
          "min-h-30 w-full resize-y rounded-ctl border border-wp-line bg-white px-4 py-3 text-base text-wp-body outline-none transition-colors placeholder:text-wp-faint focus-visible:border-wp-primary focus-visible:ring-3 focus-visible:ring-wp-primary/20 disabled:cursor-not-allowed disabled:bg-neutral-100 aria-invalid:border-wp-danger aria-invalid:ring-3 aria-invalid:ring-wp-danger/15",
          className
        )}
        {...props}
      />
      {showCount && maxLength ? (
        <span className="self-end text-xs text-wp-faint" aria-live="polite">
          {length}/{maxLength}
        </span>
      ) : null}
    </div>
  )
}

export { Textarea }
