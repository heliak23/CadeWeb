import { AnimatePresence, motion } from "framer-motion"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTema } from "@/hooks/useTema"

export function ThemeToggle() {
  const { tema, alternar } = useTema()

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={alternar}
      title={tema === "dark" ? "Mudar para tema Claro (Lite)" : "Mudar para tema Escuro (Dark)"}
      aria-label="Alternar tema claro/escuro"
      className="border-border bg-card/60 hover:bg-muted text-foreground transition-colors"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={tema}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="flex"
        >
          {tema === "dark" ? (
            <Moon className="size-4" />
          ) : (
            <Sun className="size-4" />
          )}
        </motion.span>
      </AnimatePresence>
    </Button>
  )
}
