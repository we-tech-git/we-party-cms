import * as React from "react"
import { Search } from "lucide-react"

import { cn } from "@/lib/utils"

/** Campo de busca do visual B (Figma: Search input › Médio, 44px). Role `search` + rótulo acessível. */
function SearchField({ className, "aria-label": ariaLabel, ...props }: React.ComponentProps<"input">) {
  return (
    <div role="search" className={cn("relative", className)}>
      <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-wp-sub" />
      <input
        type="search"
        data-slot="search-field"
        aria-label={ariaLabel ?? props.placeholder}
        className="h-11 w-full rounded-ctl border border-wp-line bg-white pr-4 pl-11 text-sm text-wp-body outline-none transition-colors placeholder:text-wp-faint focus-visible:border-wp-primary focus-visible:ring-3 focus-visible:ring-wp-primary/20"
        {...props}
      />
    </div>
  )
}

export { SearchField }
