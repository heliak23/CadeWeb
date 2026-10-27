import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  Star,
  MessageCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileDown,
  RefreshCw,
  Building,
  Phone,
  MapPin,
  Sparkles,
  Archive,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLeadMutations } from "@/hooks/useLeadMutations"
import { formatarNota } from "@/lib/formatters"
import { InstagramIcon } from "@/components/icons/InstagramIcon"
import { cn } from "@/lib/utils"
import type { Lead, StatusLead } from "@/types/lead"

interface LeadDetailDrawerProps {
  lead: Lead | null
  aberto: boolean
  onFechar: () => void
  onAbrirPrimeiroContato: (lead: Lead) => void
}

export function LeadDetailDrawer({
  lead,
  aberto,
  onFechar,
  onAbrirPrimeiroContato,
}: LeadDetailDrawerProps) {
  const [explicacaoAberta, setExplicacaoAberta] = useState(true)
  const [notaTexto, setNotaTexto] = useState("")
  const mutations = useLeadMutations(lead?.place_id ?? "")

  useEffect(() => {
    if (lead) {
      setNotaTexto(lead.observacoes || "")
    }
  }, [lead?.place_id, lead?.observacoes])

  // Fecha com ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && aberto) onFechar()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [aberto, onFechar])

  if (!lead) return null

  // Classificação de oportunidade
  const score = lead.score ?? 50
  const oportunidade =
    score >= 70
      ? { nivel: "Oportunidade alta", estrelas: 5, cor: "text-amber-400 fill-amber-400" }
      : score >= 40
      ? { nivel: "Oportunidade média", estrelas: 3, cor: "text-violet-400 fill-violet-400" }
      : { nivel: "Oportunidade baixa", estrelas: 1, cor: "text-neutral-400 fill-neutral-400" }

  // Distribuição estimada de estrelas do Google
  const notaNum = lead.nota ?? 4.5
  const totalAvaliacoes = lead.num_avaliacoes ?? 20
  const p5 = Math.round(Math.max(10, (notaNum / 5) * 80))
  const p4 = Math.round(Math.max(5, (100 - p5) * 0.6))
  const p3 = Math.round(Math.max(2, (100 - p5 - p4) * 0.5))
  const p2 = Math.round(Math.max(1, (100 - p5 - p4 - p3) * 0.5))
  const p1 = Math.max(1, 100 - p5 - p4 - p3 - p2)

  const agendarRetorno = (dias: number | null) => {
    if (dias === null) {
      mutations.salvarTagsFollowup.mutate({
        tags: lead.tags || "",
        proximoFollowup: null,
      })
      return
    }
    const data = new Date()
    data.setDate(data.getDate() + dias)
    const isoData = data.toISOString().split("T")[0]
    mutations.salvarTagsFollowup.mutate({
      tags: lead.tags || "",
      proximoFollowup: isoData,
    })
  }

  const salvarNota = () => {
    mutations.salvarObservacoes.mutate(notaTexto)
  }

  return (
    <AnimatePresence>
      {aberto && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop Escurecido */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onFechar}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Lateral Deslizante */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="relative z-50 flex h-full w-full max-w-xl flex-col border-l border-border bg-card text-foreground shadow-2xl overflow-y-auto"
          >
            {/* Header com Nome e Fechar */}
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-border bg-card/90 px-6 py-4 backdrop-blur-md">
              <div className="space-y-1 pr-4">
                <h2 className="text-lg font-bold text-foreground tracking-tight">{lead.nome}</h2>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
                  <span>{lead.categoria || "Comércio local"}</span>
                  {lead.cidade && (
                    <>
                      <span>·</span>
                      <span>{lead.cidade}</span>
                    </>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={onFechar}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-white/10 hover:text-white transition-colors"
                title="Fechar"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-6 p-6">
              {/* Badge de Score e Oportunidade */}
              <div className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-800 text-white shadow-lg shadow-violet-500/20 ring-1 ring-violet-400/30">
                  <span className="text-lg font-extrabold leading-none">{lead.score}</span>
                  <span className="text-[9px] uppercase tracking-wider text-violet-200">Score</span>
                </div>

                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "size-3.5",
                            i < oportunidade.estrelas ? oportunidade.cor : "text-white/20"
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-white">{oportunidade.nivel}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {lead.site_status === "sem_site" && (
                      <span className="rounded-md bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 text-[11px] font-semibold text-rose-300">
                        Sem site
                      </span>
                    )}
                    {lead.site_status === "site_ruim" && (
                      <span className="rounded-md bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[11px] font-semibold text-amber-300">
                        Site amador / lento
                      </span>
                    )}
                    {lead.site_status === "site_ok" && (
                      <span className="rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
                        Site estruturado
                      </span>
                    )}
                    {lead.num_avaliacoes && (
                      <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[11px] text-muted-foreground">
                        {lead.num_avaliacoes} avaliações no Google
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Acordeão: Por que esta empresa é uma oportunidade? */}
              <div className="rounded-xl border border-violet-500/20 bg-violet-950/10 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExplicacaoAberta(!explicacaoAberta)}
                  className="flex w-full items-center justify-between p-3.5 text-left text-xs font-semibold text-violet-300 hover:bg-violet-500/10 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-violet-400" />
                    <span>Por que esta empresa é uma oportunidade?</span>
                  </div>
                  {explicacaoAberta ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                </button>
                {explicacaoAberta && (
                  <div className="border-t border-violet-500/10 px-4 py-3 text-xs leading-relaxed text-muted-foreground/90 space-y-2">
                    {lead.site_status === "sem_site" ? (
                      <p>
                        Esta empresa possui forte reputação no Google (<strong>{formatarNota(lead.nota)} estrelas</strong> com <strong>{lead.num_avaliacoes || 0} avaliações</strong>), mas <strong>não possui site próprio</strong>. Clientes que encontram a empresa pelo Maps caem direto sem um catálogo de serviços ou botão claro de agendamento.
                      </p>
                    ) : lead.site_status === "site_ruim" ? (
                      <p>
                        A empresa tem clientes ativos e reputação consolidada, porém o site atual possui gargalos (<strong>{lead.site_problemas || "lento ou não otimizado para celulares"}</strong>). Apresentar uma versão mais moderna e rápida é o gancho ideal de fechamento.
                      </p>
                    ) : (
                      <p>
                        A empresa já possui presença web, mas pode se beneficiar de campanhas de tráfego, automação de WhatsApp ou otimização de conversão.
                      </p>
                    )}
                    <p className="text-[11px] text-violet-400/90 font-medium">
                      💡 Gancho: Use o framework &quot;Duas Perguntas&quot; ou &quot;Cliente Misterioso&quot; no primeiro contato.
                    </p>
                  </div>
                )}
              </div>

              {/* Botões de Ação Imediata: WhatsApp & Site */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Contato Direto
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => onAbrirPrimeiroContato(lead)}
                    className="h-11 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold shadow-md shadow-emerald-500/15"
                  >
                    <MessageCircle className="size-4.5" />
                    Abrir no WhatsApp
                  </Button>

                  {lead.site_url ? (
                    <Button
                      variant="outline"
                      asChild
                      className="h-11 border-white/10 bg-white/5 hover:bg-white/10 text-xs text-white"
                    >
                      <a
                        href={lead.site_url.startsWith("http") ? lead.site_url : `https://${lead.site_url}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExternalLink className="size-4" />
                        Visitar site
                      </a>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      disabled
                      className="h-11 border-white/5 bg-white/[0.02] text-xs text-muted-foreground/60"
                    >
                      <Building className="size-4" />
                      Sem site cadastrado
                    </Button>
                  )}
                </div>
              </div>

              {/* Reputação no Google (Barras de Estrelas) */}
              <div className="space-y-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white uppercase tracking-wider">
                    Reputação no Google
                  </span>
                  <span className="text-xs font-bold text-amber-400">
                    ⭐ {formatarNota(lead.nota)} · {lead.num_avaliacoes || 0} avaliações
                  </span>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  {[
                    { label: "5", pct: p5, qtd: Math.round((totalAvaliacoes * p5) / 100) },
                    { label: "4", pct: p4, qtd: Math.round((totalAvaliacoes * p4) / 100) },
                    { label: "3", pct: p3, qtd: Math.round((totalAvaliacoes * p3) / 100) },
                    { label: "2", pct: p2, qtd: Math.round((totalAvaliacoes * p2) / 100) },
                    { label: "1", pct: p1, qtd: Math.round((totalAvaliacoes * p1) / 100) },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2 text-muted-foreground">
                      <span className="w-2.5 text-right font-medium text-white">{item.label}</span>
                      <div className="h-2 flex-1 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-400"
                          style={{ width: `${item.pct}%` }}
                        />
                      </div>
                      <span className="w-6 text-right tabular-nums text-[10px] text-muted-foreground">
                        {item.qtd}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Agendamento de Retorno / Follow-up */}
              <div className="space-y-2.5 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">Retornar em:</span>
                  <span className="text-muted-foreground font-medium">
                    {lead.proximo_followup ? `📅 ${lead.proximo_followup}` : "Sem retorno marcado"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => agendarRetorno(0)}
                    className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white hover:bg-violet-500/20 hover:border-violet-500/50 transition-colors"
                  >
                    Hoje
                  </button>
                  <button
                    type="button"
                    onClick={() => agendarRetorno(1)}
                    className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white hover:bg-violet-500/20 hover:border-violet-500/50 transition-colors"
                  >
                    Amanhã
                  </button>
                  <button
                    type="button"
                    onClick={() => agendarRetorno(3)}
                    className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white hover:bg-violet-500/20 hover:border-violet-500/50 transition-colors"
                  >
                    3 dias
                  </button>
                  <button
                    type="button"
                    onClick={() => agendarRetorno(7)}
                    className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white hover:bg-violet-500/20 hover:border-violet-500/50 transition-colors"
                  >
                    1 semana
                  </button>
                  {lead.proximo_followup && (
                    <button
                      type="button"
                      onClick={() => agendarRetorno(null)}
                      className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-2 py-1 text-xs text-rose-400 hover:bg-rose-500/20 transition-colors"
                    >
                      Limpar
                    </button>
                  )}
                </div>
              </div>

              {/* Fatos do Google / Dados Cadastrais */}
              <div className="space-y-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-xs">
                <span className="font-semibold text-white uppercase tracking-wider text-[11px]">
                  Fatos do Google
                </span>
                <div className="space-y-2 text-muted-foreground">
                  {lead.telefone && (
                    <div className="flex items-center gap-2">
                      <Phone className="size-3.5 text-white/60 shrink-0" />
                      <span className="text-white">{lead.telefone}</span>
                    </div>
                  )}
                  {lead.endereco && (
                    <div className="flex items-start gap-2">
                      <MapPin className="size-3.5 text-white/60 shrink-0 mt-0.5" />
                      <span>{lead.endereco}</span>
                    </div>
                  )}
                  {lead.instagram_url && (
                    <div className="flex items-center gap-2">
                      <InstagramIcon className="size-3.5 text-pink-400 shrink-0" />
                      <a
                        href={lead.instagram_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-pink-300 hover:underline"
                      >
                        Instagram da Empresa
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Etapa e Notas */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-white">Etapa no Funil</span>
                  <Select
                    value={lead.status}
                    onValueChange={(val) => mutations.atualizarStatus.mutate(val as StatusLead)}
                  >
                    <SelectTrigger className="border-border bg-card text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-border bg-popover text-popover-foreground">
                      <SelectItem value="novo">Novo</SelectItem>
                      <SelectItem value="contatado">Contatado</SelectItem>
                      <SelectItem value="respondeu">Respondeu</SelectItem>
                      <SelectItem value="reuniao">Reunião Agendada</SelectItem>
                      <SelectItem value="fechou">Fechou (Venda Ganha)</SelectItem>
                      <SelectItem value="recusou">Recusou</SelectItem>
                      <SelectItem value="ignorado">Ignorado / Arquivado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">Notas internas</span>
                    <button
                      type="button"
                      onClick={salvarNota}
                      className="text-[11px] text-violet-600 dark:text-violet-400 hover:underline font-semibold"
                    >
                      Salvar nota
                    </button>
                  </div>
                  <Textarea
                    value={notaTexto}
                    onChange={(e) => setNotaTexto(e.target.value)}
                    placeholder="Registre o contexto da conversa, detalhes acordados ou próximos passos..."
                    rows={3}
                    className="border-border bg-card text-xs resize-none"
                  />
                </div>
              </div>

              {/* Ações Especiais: Diagnóstico em PDF, Cockpit, Exclusão */}
              <div className="flex flex-col gap-2 border-t border-border pt-4">
                <div className="flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    asChild
                    className="flex-1 border-border bg-card text-xs text-foreground hover:bg-muted"
                  >
                    <a href={`/api/leads/${encodeURIComponent(lead.place_id)}/diagnostico.pdf`}>
                      <FileDown className="size-4" />
                      Baixar diagnóstico (PDF)
                    </a>
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => mutations.reanalisarSite.mutate()}
                    disabled={mutations.reanalisarSite.isPending}
                    className="border-white/10 bg-white/5 text-xs text-white hover:bg-white/10"
                    title="Reanalisa site agora"
                  >
                    <RefreshCw className={cn("size-3.5", mutations.reanalisarSite.isPending && "animate-spin")} />
                    Reanalisar
                  </Button>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => mutations.ignorar.mutate(lead.status, { onSuccess: onFechar })}
                    className="text-xs text-rose-400/80 hover:bg-rose-500/10 hover:text-rose-400"
                  >
                    <Archive className="size-3.5 mr-1" />
                    Arquivar lead
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
