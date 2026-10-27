import { useState } from "react"
import { AnimatePresence } from "framer-motion"
import { LayoutGrid, List, Loader2, Trash2 } from "lucide-react"
import { useLeads } from "@/hooks/useLeads"
import { useSelecaoLeads } from "@/hooks/useSelecaoLeads"
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver"
import { useBulkMutations } from "@/hooks/useBulkMutations"
import { LeadCard } from "@/components/leads/LeadCard"
import { EmptyState } from "@/components/leads/EmptyState"
import { BulkActionsBar } from "@/components/leads/BulkActionsBar"
import { KanbanBoard } from "@/components/leads/KanbanBoard"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import type { FiltrosLeads, Lead } from "@/types/lead"

interface LeadGridProps {
  filtros: FiltrosLeads
  filtrosEmUso: boolean
  onLimparFiltros: () => void
  onSelecionarLead: (lead: Lead) => void
  onNovaBusca?: () => void
  onAbrirPrimeiroContato?: (lead: Lead) => void
}

export function LeadGrid({
  filtros,
  filtrosEmUso,
  onLimparFiltros,
  onSelecionarLead,
  onNovaBusca,
  onAbrirPrimeiroContato,
}: LeadGridProps) {
  const [visualizacao, setVisualizacao] = useState<"lista" | "kanban">("kanban")

  const filtrosEfetivos: FiltrosLeads =
    visualizacao === "kanban" ? { ...filtros, status: "" } : filtros

  const { leads, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useLeads(filtrosEfetivos)
  // ao trocar filtro/visualização, a seleção zera (não age em leads invisíveis)
  const { selecionados, alternar, limpar, quantidade } = useSelecaoLeads(
    JSON.stringify(filtrosEfetivos)
  )
  const { excluirEmLoteDefinitivamente } = useBulkMutations()
  const modoIgnorados = filtros.status === "ignorado"

  const sentinelaRef = useIntersectionObserver(
    () => fetchNextPage(),
    Boolean(hasNextPage) && !isFetchingNextPage
  )

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[150px]" />
        ))}
      </div>
    )
  }

  if (leads.length === 0) {
    return (
      <EmptyState
        filtrosEmUso={filtrosEmUso}
        onLimparFiltros={onLimparFiltros}
        onNovaBusca={onNovaBusca}
      />
    )
  }

  const leadsForaDoFunil = leads.filter((l) =>
    l.status === "ignorado"
  ).length

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {leads.length} lead(s) carregado(s)
        </p>
        <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 px-3 text-xs font-semibold rounded-lg transition-all",
              visualizacao === "kanban"
                ? "bg-violet-600 text-white shadow-md shadow-violet-600/30 font-bold"
                : "text-muted-foreground hover:text-white"
            )}
            onClick={() => setVisualizacao("kanban")}
          >
            <LayoutGrid className="size-3.5 mr-1" />
            Kanban
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 px-3 text-xs font-semibold rounded-lg transition-all",
              visualizacao === "lista"
                ? "bg-violet-600 text-white shadow-md shadow-violet-600/30 font-bold"
                : "text-muted-foreground hover:text-white"
            )}
            onClick={() => setVisualizacao("lista")}
          >
            <List className="size-3.5 mr-1" />
            Lista
          </Button>
        </div>

        {modoIgnorados && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="size-4" />
                Esvaziar ignorados
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Excluir todos os {leads.length} lead(s) ignorado(s)?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Isso apaga de vez todos os leads ignorados carregados nesta
                  lista. Não tem como desfazer, e se a mesma busca rodar de
                  novo no futuro, eles podem voltar a aparecer como leads
                  novos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() =>
                    excluirEmLoteDefinitivamente.mutate(
                      leads.map((l) => l.place_id)
                    )
                  }
                >
                  Excluir todos
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {visualizacao === "kanban" ? (
        <>
          <div className="w-full">
            <KanbanBoard
              leads={leads}
              onSelecionarLead={onSelecionarLead}
              onAbrirPrimeiroContato={onAbrirPrimeiroContato}
            />
          </div>
          {leadsForaDoFunil > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              {leadsForaDoFunil} lead(s) ignorado(s) não aparecem
              no Kanban — use a visualização em Lista para vê-los.
            </p>
          )}
        </>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {leads.map((lead) => (
            <LeadCard
              key={lead.place_id}
              lead={lead}
              onClick={() => onSelecionarLead(lead)}
              selecionado={selecionados.has(lead.place_id)}
              onAlternarSelecao={() => alternar(lead.place_id)}
            />
          ))}
        </div>
      )}

      {visualizacao === "lista" && hasNextPage && (
        <div ref={sentinelaRef} className="flex justify-center py-6">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      )}

      <AnimatePresence>
        {quantidade > 0 && (
          <BulkActionsBar
            placeIdsSelecionados={Array.from(selecionados)}
            onLimparSelecao={limpar}
            modoIgnorados={modoIgnorados}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
