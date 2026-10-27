import {
  Star,
  MessageCircle,
  ExternalLink,
  ArrowUpRight,
  Sparkles,
  Trash2,
} from "lucide-react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@/lib/utils"
import { formatarNota, followupVencidoOuHoje } from "@/lib/formatters"
import { InstagramIcon } from "@/components/icons/InstagramIcon"
import { ModalExcluirEmpresa } from "@/components/leads/ModalExcluirEmpresa"
import { useLeadMutations } from "@/hooks/useLeadMutations"
import type { Lead, StatusLead } from "@/types/lead"

interface KanbanCardProps {
  lead: Lead
  onClick: () => void
  onAbrirPrimeiroContato?: (lead: Lead) => void
}

export function KanbanCard({
  lead,
  onClick,
  onAbrirPrimeiroContato,
}: KanbanCardProps) {
  const vencido = followupVencidoOuHoje(lead.proximo_followup)
  const mutations = useLeadMutations(lead.place_id)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: lead.place_id })

  // Score e Oportunidade
  const score = lead.score ?? 50
  const oportunidade =
    score >= 70
      ? { nivel: "Oportunidade alta", estrelas: 5, dots: 5, cor: "text-amber-400 fill-amber-400" }
      : score >= 40
      ? { nivel: "Oportunidade média", estrelas: 3, dots: 3, cor: "text-violet-400 fill-violet-400" }
      : { nivel: "Oportunidade baixa", estrelas: 1, dots: 1, cor: "text-neutral-400 fill-neutral-400" }

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.35 : 1,
      }}
      {...attributes}
      {...listeners}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick()
      }}
      aria-label={`Abrir detalhes de ${lead.nome}`}
      className={cn(
        "group relative flex flex-col gap-2 rounded-2xl border p-3.5 text-left text-xs transition-all duration-150 cursor-grab active:cursor-grabbing",
        "border-border bg-card shadow-sm hover:border-violet-500/40 hover:shadow-md dark:border-white/[0.08] dark:bg-[#161720]/90 dark:hover:bg-[#1a1b26] dark:hover:shadow-violet-950/20",
        vencido && "ring-1 ring-amber-500/60 border-amber-500/30",
        isDragging && "shadow-2xl ring-2 ring-violet-500/50 scale-[1.02]"
      )}
    >
      {/* Top Header: Nome + Botão Expandir */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h4 className="truncate font-semibold text-sm text-foreground tracking-tight group-hover:text-violet-600 dark:group-hover:text-violet-200 transition-colors">
            {lead.nome}
          </h4>
          <p className="truncate text-[11px] text-muted-foreground mt-0.5">
            {lead.categoria || "Comércio local"}{lead.cidade ? ` · ${lead.cidade}` : ""}
          </p>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onClick()
          }}
          className="rounded-lg p-1 text-muted-foreground/60 hover:bg-white/10 hover:text-white transition-colors"
          title="Ver detalhes"
        >
          <ArrowUpRight className="size-3.5" />
        </button>
      </div>

      {/* Badges de Diagnóstico e Reputação */}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        {lead.site_status === "sem_site" && (
          <span className="rounded-md bg-rose-500/15 border border-rose-500/25 px-2 py-0.5 text-[10px] font-semibold text-rose-300">
            Sem site
          </span>
        )}
        {lead.site_status === "site_ruim" && (
          <span className="rounded-md bg-amber-500/15 border border-amber-500/25 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
            Site amador
          </span>
        )}
        {lead.site_status === "site_ok" && (
          <span className="rounded-md bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
            Com site
          </span>
        )}

        {lead.nota && (
          <span className="flex items-center gap-1 rounded-md bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-muted-foreground">
            <Star className="size-2.5 fill-amber-400 text-amber-400" />
            <span>{formatarNota(lead.nota)}</span>
            {lead.num_avaliacoes ? <span>· {lead.num_avaliacoes}</span> : null}
          </span>
        )}
      </div>

      {/* Classificação de Oportunidade */}
      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/[0.04]">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "size-1.5 rounded-full",
                  i < oportunidade.dots ? "bg-amber-400" : "bg-white/15"
                )}
              />
            ))}
          </div>
          <span className="text-[11px] text-muted-foreground font-medium">
            {oportunidade.nivel}
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onClick()
          }}
          className="text-[10px] text-violet-400/90 hover:text-violet-300 font-medium hover:underline"
        >
          Entenda a oportunidade
        </button>
      </div>

      {/* Lembrete de Follow-up se houver */}
      {lead.proximo_followup && (
        <div className="flex items-center gap-1 text-[10px] text-amber-400/90 bg-amber-500/10 rounded-lg px-2 py-1">
          <Sparkles className="size-3 shrink-0" />
          <span>Retorno: {lead.proximo_followup}</span>
        </div>
      )}

      {/* Barra de Ações Rápidas no Rodapé do Card */}
      <div className="flex items-center justify-between pt-1 border-t border-white/[0.04] mt-0.5">
        <div className="flex items-center gap-1">
          {/* Botão WhatsApp */}
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              if (onAbrirPrimeiroContato) {
                onAbrirPrimeiroContato(lead)
              } else {
                onClick()
              }
            }}
            className="flex size-7 items-center justify-center rounded-lg border border-white/5 bg-white/[0.03] text-muted-foreground hover:bg-emerald-500/15 hover:border-emerald-500/30 hover:text-emerald-400 transition-colors"
            title="Escolher abordagem e abrir no WhatsApp"
          >
            <MessageCircle className="size-3.5" />
          </button>

          {/* Botão Site */}
          {lead.site_url ? (
            <a
              href={lead.site_url.startsWith("http") ? lead.site_url : `https://${lead.site_url}`}
              target="_blank"
              rel="noreferrer"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              className="flex size-7 items-center justify-center rounded-lg border border-white/5 bg-white/[0.03] text-muted-foreground hover:bg-white/10 hover:text-white transition-colors"
              title="Abrir site"
            >
              <ExternalLink className="size-3.5" />
            </a>
          ) : (
            <span
              className="flex size-7 items-center justify-center rounded-lg border border-white/[0.02] bg-white/[0.01] text-white/15 cursor-not-allowed"
              title="Sem site"
            >
              <ExternalLink className="size-3.5" />
            </span>
          )}

          {/* Botão Instagram */}
          {lead.instagram_url && (
            <a
              href={lead.instagram_url}
              target="_blank"
              rel="noreferrer"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              className="flex size-7 items-center justify-center rounded-lg border border-white/5 bg-white/[0.03] text-muted-foreground hover:bg-pink-500/15 hover:border-pink-500/30 hover:text-pink-400 transition-colors"
              title="Abrir Instagram"
            >
              <InstagramIcon className="size-3.5" />
            </a>
          )}

          {/* Botão Excluir Empresa */}
          <div onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
            <ModalExcluirEmpresa
              nomeEmpresa={lead.nome}
              status={lead.status}
              trigger={
                <button
                  type="button"
                  className="flex size-7 items-center justify-center rounded-lg border border-white/5 bg-white/[0.03] text-muted-foreground hover:bg-rose-500/15 hover:border-rose-500/30 hover:text-rose-400 transition-colors"
                  title="Excluir empresa"
                >
                  <Trash2 className="size-3.5" />
                </button>
              }
              onExcluirDaLista={() => mutations.ignorar.mutate(lead.status)}
              onExcluirDefinitivamente={() => mutations.excluirDefinitivamente.mutate(true)}
            />
          </div>
        </div>

        {/* Dropdown Rápido de Status no próprio card */}
        <div
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <select
            value={lead.status}
            onChange={(e) => mutations.atualizarStatus.mutate(e.target.value as StatusLead)}
            className="rounded-lg border border-border bg-card px-2 py-1 text-[10px] font-medium text-muted-foreground hover:text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500 transition-colors"
          >
            <option value="novo" className="bg-popover text-popover-foreground">Novo</option>
            <option value="contatado" className="bg-popover text-popover-foreground">Contatado</option>
            <option value="respondeu" className="bg-popover text-popover-foreground">Respondeu</option>
            <option value="reuniao" className="bg-popover text-popover-foreground">Reunião</option>
            <option value="fechou" className="bg-popover text-popover-foreground">Fechou</option>
            <option value="recusou" className="bg-popover text-popover-foreground">Recusou</option>
          </select>
        </div>
      </div>
    </div>
  )
}
