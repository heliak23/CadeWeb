import { Archive, Flame, Star, Trash2 } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { formatarNota, followupVencidoOuHoje } from "@/lib/formatters"
import { useLeadMutations } from "@/hooks/useLeadMutations"
import { StatusBadge } from "@/components/leads/StatusBadge"
import { SiteStatusBadge } from "@/components/leads/SiteStatusBadge"
import { TagChips } from "@/components/leads/TagChips"
import { FollowupBadge } from "@/components/leads/FollowupBadge"
import { LeadDificilBadge } from "@/components/leads/LeadDificilBadge"
import { InstagramIcon } from "@/components/icons/InstagramIcon"
import { ModalExcluirEmpresa } from "@/components/leads/ModalExcluirEmpresa"
import type { Lead } from "@/types/lead"

interface LeadCardProps {
  lead: Lead
  onClick: () => void
  selecionado: boolean
  onAlternarSelecao: () => void
}

export function LeadCard({
  lead,
  onClick,
  selecionado,
  onAlternarSelecao,
}: LeadCardProps) {
  const vencido = followupVencidoOuHoje(lead.proximo_followup)
  const { ignorar, excluirDefinitivamente } = useLeadMutations(lead.place_id)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick()
      }}
      aria-label={`Abrir detalhes de ${lead.nome}`}
      className={cn(
        "relative flex cursor-pointer flex-col gap-2 rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        vencido && "ring-2 ring-warning",
        selecionado && "ring-2 ring-primary"
      )}
    >
      <input
        type="checkbox"
        checked={selecionado}
        onChange={() => onAlternarSelecao()}
        onClick={(e) => e.stopPropagation()}
        aria-label={`Selecionar ${lead.nome}`}
        className="absolute right-3 top-3 size-4 cursor-pointer accent-primary"
      />

      <div className="flex items-start justify-between gap-2 pr-6">
        <h3 className="font-medium leading-snug">{lead.nome}</h3>
        <div className="flex flex-col items-end gap-1">
          <StatusBadge status={lead.status} />
          {vencido && <FollowupBadge />}
          {lead.lead_dificil && <LeadDificilBadge />}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        {lead.categoria || "Sem categoria"}
      </p>
      <p className="text-xs text-muted-foreground">
        {lead.endereco || "Sem endereço"}
      </p>

      <TagChips tags={lead.tags} />

      <div className="flex flex-wrap items-center gap-1.5">
        <SiteStatusBadge
          siteStatus={lead.site_status}
          siteProblemas={lead.site_problemas}
        />
        {lead.instagram_url && (
          <a
            href={lead.instagram_url}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            title={`Abrir Instagram do negócio: ${lead.instagram_url}`}
            className="inline-flex items-center text-instagram-mid hover:opacity-80"
            aria-label="Abrir Instagram do negócio"
          >
            <InstagramIcon className="size-3.5" />
          </a>
        )}
      </div>

      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
        <Star className="size-3.5 fill-warning text-warning" />
        <span className="font-medium text-foreground">
          {formatarNota(lead.nota)}
        </span>
        <span>({lead.num_avaliacoes ?? 0} avaliações)</span>
        <span
          className="ml-auto inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 font-medium text-primary"
          title="Score de prioridade (nota + volume de avaliações + situação do site)"
        >
          <Flame className="size-3" />
          {lead.score}
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-border/50 pt-2">
        <div className="flex items-center gap-1.5">
          {lead.lead_dificil && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs border-destructive/40 text-destructive hover:bg-destructive/10"
              onClick={(e) => {
                e.stopPropagation()
                ignorar.mutate(lead.status)
              }}
            >
              <Archive className="size-3 mr-1" />
              Arquivar difícil
            </Button>
          )}
        </div>

        <div onClick={(e) => e.stopPropagation()}>
          <ModalExcluirEmpresa
            nomeEmpresa={lead.nome}
            status={lead.status}
            trigger={
              <button
                type="button"
                className="flex size-7 items-center justify-center rounded-lg border border-border bg-card/60 text-muted-foreground hover:bg-rose-500/15 hover:border-rose-500/30 hover:text-rose-400 transition-colors ml-auto"
                title="Excluir empresa"
              >
                <Trash2 className="size-3.5" />
              </button>
            }
            onExcluirDaLista={() => ignorar.mutate(lead.status)}
            onExcluirDefinitivamente={() => excluirDefinitivamente.mutate(true)}
          />
        </div>
      </div>
    </motion.div>
  )
}
