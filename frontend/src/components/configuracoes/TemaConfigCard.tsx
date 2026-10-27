import { Sun, Moon, Check, Sparkles } from "lucide-react"
import { useTema } from "@/hooks/useTema"
import { cn } from "@/lib/utils"

export function TemaConfigCard() {
  const { tema, mudarTema } = useTema()

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
            <Sparkles className="size-4" />
          </div>
          <div>
            <h3 className="text-base font-bold tracking-tight text-foreground">
              Aparência e Tema
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Escolha entre o tema Claro (Lite) e o tema Escuro (Dark) para a interface do aplicativo.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-1">
        {/* Opção Tema Claro (Lite) */}
        <button
          type="button"
          onClick={() => mudarTema("light")}
          className={cn(
            "group relative flex flex-col gap-3 rounded-xl border p-4 text-left transition-all duration-200",
            tema === "light"
              ? "border-violet-600 bg-violet-500/[0.05] ring-2 ring-violet-500/30 shadow-md"
              : "border-border bg-card/60 hover:border-border/80 hover:bg-muted/40"
          )}
        >
          {/* Mockup visual miniatura do tema Lite */}
          <div className="relative h-24 w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100 p-2 shadow-inner">
            <div className="flex h-full w-full gap-1.5">
              {/* Mini sidebar clara */}
              <div className="h-full w-1/4 rounded bg-white border border-slate-200/80 p-1 flex flex-col gap-1">
                <div className="h-2 w-3/4 rounded bg-violet-500/40" />
                <div className="h-1.5 w-full rounded bg-slate-200" />
                <div className="h-1.5 w-4/5 rounded bg-slate-200" />
              </div>
              {/* Mini conteúdo claro */}
              <div className="flex-1 flex flex-col gap-1.5 p-1">
                <div className="h-2 w-1/2 rounded bg-slate-300" />
                <div className="grid grid-cols-2 gap-1 flex-1">
                  <div className="rounded bg-white border border-slate-200/60 p-1" />
                  <div className="rounded bg-white border border-slate-200/60 p-1" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Sun className="size-4" />
              </div>
              <div>
                <span className="text-sm font-bold text-foreground">Tema Claro (Lite)</span>
                <p className="text-[11px] text-muted-foreground">Alto contraste para o dia</p>
              </div>
            </div>

            {tema === "light" && (
              <span className="flex size-5 items-center justify-center rounded-full bg-violet-600 text-white shadow-sm">
                <Check className="size-3 stroke-[3]" />
              </span>
            )}
          </div>
        </button>

        {/* Opção Tema Escuro (Dark) */}
        <button
          type="button"
          onClick={() => mudarTema("dark")}
          className={cn(
            "group relative flex flex-col gap-3 rounded-xl border p-4 text-left transition-all duration-200",
            tema === "dark"
              ? "border-violet-500 bg-violet-500/10 ring-2 ring-violet-500/30 shadow-md shadow-violet-950/20"
              : "border-border bg-card/60 hover:border-border/80 hover:bg-muted/40"
          )}
        >
          {/* Mockup visual miniatura do tema Dark */}
          <div className="relative h-24 w-full overflow-hidden rounded-lg border border-neutral-800 bg-[#0b0c10] p-2 shadow-inner">
            <div className="flex h-full w-full gap-1.5">
              {/* Mini sidebar escura */}
              <div className="h-full w-1/4 rounded bg-[#12131a] border border-white/10 p-1 flex flex-col gap-1">
                <div className="h-2 w-3/4 rounded bg-violet-400/60" />
                <div className="h-1.5 w-full rounded bg-neutral-800" />
                <div className="h-1.5 w-4/5 rounded bg-neutral-800" />
              </div>
              {/* Mini conteúdo escuro */}
              <div className="flex-1 flex flex-col gap-1.5 p-1">
                <div className="h-2 w-1/2 rounded bg-neutral-700" />
                <div className="grid grid-cols-2 gap-1 flex-1">
                  <div className="rounded bg-[#12131a] border border-white/[0.08] p-1" />
                  <div className="rounded bg-[#12131a] border border-white/[0.08] p-1" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-violet-500/15 text-violet-400 border border-violet-500/25">
                <Moon className="size-4" />
              </div>
              <div>
                <span className="text-sm font-bold text-foreground">Tema Escuro (Dark)</span>
                <p className="text-[11px] text-muted-foreground">Confortável para pouca luz</p>
              </div>
            </div>

            {tema === "dark" && (
              <span className="flex size-5 items-center justify-center rounded-full bg-violet-600 text-white shadow-sm">
                <Check className="size-3 stroke-[3]" />
              </span>
            )}
          </div>
        </button>
      </div>
    </div>
  )
}
