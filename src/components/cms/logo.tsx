import { cn } from "@/lib/utils"

/** Logotipo WE PARTY em texto (Baloo Thambi 2 ExtraBold, gradiente da marca). */
function Logo({ className }: { className?: string }) {
  return (
    <span
      data-testid="brand-logo"
      className={cn(
        "bg-(image:--wp-gradient) bg-clip-text font-extrabold tracking-wide text-transparent select-none",
        className
      )}
      style={{ fontFamily: "var(--font-baloo), 'Baloo Thambi 2', cursive" }}
    >
      WE PARTY
    </span>
  )
}

export { Logo }
