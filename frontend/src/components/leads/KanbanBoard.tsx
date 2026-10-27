import { useMemo, useState } from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useDroppable } from "@dnd-kit/core"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { LABEL_STATUS } from "@/lib/constants"
import { KanbanCard } from "@/components/leads/KanbanCard"
import { leadsService } from "@/services/leadsService"
import { useInvalidarLeads } from "@/hooks/useInvalidarLeads"
import { tocarSom } from "@/hooks/useSom"
import type { Lead, StatusLead } from "@/types/lead"

const COLUNAS_FUNIL: StatusLead[] = [
  "novo",
  "contatado",
  "respondeu",
  "reuniao",
  "fechou",
  "recusou",
]

interface KanbanColunaProps {
  status: StatusLead
  leads: Lead[]
  onSelecionarLead: (lead: Lead) => void
  onAbrirPrimeiroContato?: (lead: Lead) => void
}

function KanbanColuna({
  status,
  leads,
  onSelecionarLead,
  onAbrirPrimeiroContato,
}: KanbanColunaProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-80 shrink-0 flex-col gap-2.5 rounded-2xl border p-3 transition-all duration-200",
        "border-border bg-card/70 dark:bg-[#0e0f15]/80 backdrop-blur-md shadow-sm",
        isOver && "border-violet-500/80 bg-violet-500/10 dark:bg-violet-950/20 ring-2 ring-violet-500/40 shadow-xl shadow-violet-950/30"
      )}
    >
      {/* Coluna Header com Nome e Contador */}
      <div className="flex items-center justify-between px-1.5 py-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-foreground tracking-wide">
            {LABEL_STATUS[status]}
          </span>
          <span className="flex size-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
            {leads.length}
          </span>
        </div>
      </div>

      <SortableContext
        items={leads.map((l) => l.place_id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex min-h-[120px] flex-col gap-2.5">
          {leads.map((lead) => (
            <KanbanCard
              key={lead.place_id}
              lead={lead}
              onClick={() => onSelecionarLead(lead)}
              onAbrirPrimeiroContato={onAbrirPrimeiroContato}
            />
          ))}

          {leads.length === 0 && (
            <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-white/5 py-8 text-center text-xs text-muted-foreground/40">
              Nenhum lead nesta etapa
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}

interface KanbanBoardProps {
  leads: Lead[]
  onSelecionarLead: (lead: Lead) => void
  onAbrirPrimeiroContato?: (lead: Lead) => void
}

export function KanbanBoard({
  leads,
  onSelecionarLead,
  onAbrirPrimeiroContato,
}: KanbanBoardProps) {
  const invalidarListaEMetricas = useInvalidarLeads()
  const [leadArrastado, setLeadArrastado] = useState<Lead | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const leadsPorStatus = useMemo(() => {
    const grupos: Record<string, Lead[]> = {}
    for (const status of COLUNAS_FUNIL) grupos[status] = []
    for (const lead of leads) {
      if (grupos[lead.status]) grupos[lead.status].push(lead)
    }
    return grupos
  }, [leads])

  const handleDragStart = (event: DragStartEvent) => {
    const lead = leads.find((l) => l.place_id === event.active.id)
    setLeadArrastado(lead ?? null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setLeadArrastado(null)
    const { active, over } = event
    if (!over) return

    const lead = leads.find((l) => l.place_id === active.id)
    if (!lead) return

    const novoStatus = COLUNAS_FUNIL.includes(over.id as StatusLead)
      ? (over.id as StatusLead)
      : leads.find((l) => l.place_id === over.id)?.status

    if (!novoStatus || novoStatus === lead.status) return

    leadsService.atualizarStatus(lead.place_id, novoStatus).then(
      () => {
        invalidarListaEMetricas()
        tocarSom(novoStatus === "fechou" ? "lead-fechou" : "card-movido")
        toast.success(`Movido para ${LABEL_STATUS[novoStatus]}.`)
      },
      () => toast.error("Não foi possível mover o lead. Tente novamente.")
    )
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUNAS_FUNIL.map((status) => (
          <KanbanColuna
            key={status}
            status={status}
            leads={leadsPorStatus[status]}
            onSelecionarLead={onSelecionarLead}
            onAbrirPrimeiroContato={onAbrirPrimeiroContato}
          />
        ))}
      </div>

      <p className="pt-1 text-xs text-muted-foreground/60">
        6 etapas no quadro. Arraste por um espaço vazio ou role para o lado.
      </p>

      <DragOverlay>
        {leadArrastado && (
          <div className="rotate-2 scale-105 shadow-2xl ring-2 ring-violet-500/80 rounded-2xl">
            <KanbanCard lead={leadArrastado} onClick={() => {}} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
