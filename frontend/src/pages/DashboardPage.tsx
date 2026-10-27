import { useState } from "react"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  MessageCircle,
  Sparkles,
  Zap,
} from "lucide-react"
import { AppLayout } from "@/components/layout/AppLayout"
import { Button } from "@/components/ui/button"
import { ModalPrimeiroContato } from "@/components/leads/ModalPrimeiroContato"
import { useTarefasHoje } from "@/hooks/useTarefasHoje"
import { metricasService } from "@/services/metricasService"
import { linkWhatsappComMensagem } from "@/services/tarefasService"
import { formatarNota } from "@/lib/formatters"
import type { Lead } from "@/types/lead"

function obterDataFormatadaHoje(): string {
  const agora = new Date()
  const diasSemana = [
    "DOMINGO",
    "SEGUNDA-FEIRA",
    "TERÇA-FEIRA",
    "QUARTA-FEIRA",
    "QUINTA-FEIRA",
    "SEXTA-FEIRA",
    "SÁBADO",
  ]
  const meses = [
    "JANEIRO",
    "FEVEREIRO",
    "MARÇO",
    "ABRIL",
    "MAIO",
    "JUNHO",
    "JULHO",
    "AGOSTO",
    "SETEMBRO",
    "OUTUBRO",
    "NOVEMBRO",
    "DEZEMBRO",
  ]

  const diaSemana = diasSemana[agora.getDay()]
  const dia = agora.getDate()
  const mes = meses[agora.getMonth()]

  return `HOJE · ${diaSemana}, ${dia} DE ${mes}`
}

export function DashboardPage() {
  const { tarefas, marcarFollowupEnviado, marcarContatado } = useTarefasHoje()
  const { data: metricas } = useQuery({
    queryKey: ["metricas"],
    queryFn: metricasService.buscar,
  })

  const [leadPrimeiroContato, setLeadPrimeiroContato] = useState<Lead | null>(null)

  const followups = tarefas.data?.followups ?? []
  const novosQuentes = tarefas.data?.novos_quentes ?? []

  const contatadosQtd = metricas?.por_status?.contatado ?? 0
  const responderamQtd = metricas?.por_status?.respondeu ?? 0
  const fechadasQtd = metricas?.por_status?.fechou ?? 0
  const totalLeads = metricas?.total ?? 0

  return (
    <AppLayout breadcrumb="Hoje">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        {/* Header do Cockpit: Data e Resumo de Ação */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-violet-400">
              {obterDataFormatadaHoje()}
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              {followups.length} retorno{followups.length === 1 ? "" : "s"} e{" "}
              {novosQuentes.length} empresa{novosQuentes.length === 1 ? "" : "s"} nova{novosQuentes.length === 1 ? "" : "s"}.
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              asChild
              className="border-white/10 bg-white/[0.03] text-xs font-semibold text-white hover:bg-white/10"
            >
              <Link to="/leads">
                <Building2 className="size-4" />
                Ver todas empresas
              </Link>
            </Button>

            <Button
              asChild
              className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-xs font-bold text-neutral-950 shadow-md shadow-amber-500/20 hover:brightness-105"
            >
              <Link to="/sessao">
                <Zap className="size-4" />
                Iniciar Sessão Foco
              </Link>
            </Button>
          </div>
        </div>

        {/* Grid Principal: Fila de Ação vs Resumo da Semana */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Coluna Esquerda (8 colunas): Fila de Hoje & Empresas Novas */}
          <div className="space-y-6 lg:col-span-8">
            {/* Bloco 1: Fila de Hoje (Follow-ups) */}
            <div className="space-y-3 rounded-2xl border border-white/[0.08] bg-[#12131a] p-5 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">Fila de hoje</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {followups.length > 0
                      ? `${followups.length} retorno(s) pendente(s) de abordagem`
                      : "Nenhum retorno pendente para hoje. Parabéns!"}
                  </p>
                </div>
                {followups.length > 0 && (
                  <span className="rounded-full bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 text-xs font-bold text-amber-300">
                    {followups.length} ações
                  </span>
                )}
              </div>

              <div className="space-y-2.5 pt-1">
                {followups.slice(0, 5).map((tarefa) => (
                  <div
                    key={tarefa.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 transition-colors hover:border-violet-500/30 hover:bg-white/[0.03]"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <AlertCircle className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="truncate font-semibold text-sm text-white">{tarefa.titulo}</h4>
                        <p className="truncate text-xs text-muted-foreground mt-0.5">
                          Follow-up nº {tarefa.follow_ups_enviados + 1} · {tarefa.proximo_followup}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {tarefa.whatsapp_link && (
                        <Button
                          size="sm"
                          asChild
                          className="h-8 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs"
                        >
                          <a
                            href={linkWhatsappComMensagem(tarefa.whatsapp_link, tarefa.mensagem)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <MessageCircle className="size-3.5" />
                            Abrir no WhatsApp
                          </a>
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => marcarFollowupEnviado.mutate(tarefa)}
                        disabled={marcarFollowupEnviado.isPending}
                        className="h-8 border-white/10 bg-white/5 text-xs text-muted-foreground hover:text-white"
                        title="Marcar retorno como concluído"
                      >
                        <CheckCircle2 className="size-3.5" />
                        Concluir
                      </Button>
                    </div>
                  </div>
                ))}

                {followups.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-xs text-muted-foreground">
                    <CheckCircle2 className="size-8 text-emerald-400/80 mb-2" />
                    <p className="font-medium text-white">Tudo em dia!</p>
                    <p className="mt-1">Você não tem retornos atrasados para hoje.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bloco 2: Empresas Novas da Última Busca */}
            <div className="space-y-3 rounded-2xl border border-white/[0.08] bg-[#12131a] p-5 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">Empresas novas</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Da última busca, prontas para primeiro contato
                  </p>
                </div>
                <Link
                  to="/leads"
                  className="text-xs font-semibold text-violet-400 hover:text-violet-300 hover:underline"
                >
                  Ver no CRM ↗
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-1">
                {novosQuentes.slice(0, 6).map((leadQuente) => (
                  <div
                    key={leadQuente.id}
                    className="flex flex-col justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 transition-all hover:border-violet-500/30 hover:bg-white/[0.03]"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-xs text-white line-clamp-1">
                          {leadQuente.titulo}
                        </h4>
                        <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-400">
                          ⭐ {formatarNota(leadQuente.nota)}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                        {leadQuente.categoria || "Empresa Local"}
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                        <span className="rounded-md bg-violet-500/15 border border-violet-500/25 px-2 py-0.5 text-[10px] font-semibold text-violet-300">
                          Score {leadQuente.score}
                        </span>
                        {leadQuente.site_status === "sem_site" && (
                          <span className="rounded-md bg-rose-500/15 border border-rose-500/25 px-2 py-0.5 text-[10px] font-semibold text-rose-300">
                            Sem site
                          </span>
                        )}
                        {leadQuente.site_status === "site_ruim" && (
                          <span className="rounded-md bg-amber-500/15 border border-amber-500/25 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                            Site amador
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/[0.04] pt-2 mt-1">
                      <button
                        type="button"
                        onClick={() =>
                          setLeadPrimeiroContato({
                            place_id: leadQuente.id,
                            nome: leadQuente.titulo,
                            categoria: leadQuente.categoria,
                            endereco: null,
                            nota: leadQuente.nota,
                            num_avaliacoes: leadQuente.num_avaliacoes,
                            whatsapp_link: leadQuente.whatsapp_link,
                            telefone: leadQuente.telefone,
                            query_origem: null,
                            nicho: leadQuente.categoria,
                            cidade: null,
                            status: "novo",
                            observacoes: null,
                            mensagem_gerada: leadQuente.mensagem,
                            visto_em: null,
                            atualizado_em: null,
                            tags: null,
                            proximo_followup: null,
                            follow_ups_enviados: 0,
                            ultimo_followup_em: null,
                            lead_dificil: false,
                            score: leadQuente.score,
                            site_url: null,
                            site_status: leadQuente.site_status,
                            site_problemas: leadQuente.site_problemas,
                            site_checklist: null,
                            instagram_url: leadQuente.instagram_url,
                          })
                        }
                        className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                      >
                        <MessageCircle className="size-3.5" />
                        <span>Abordar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => marcarContatado.mutate(leadQuente.id)}
                        className="text-[11px] text-muted-foreground hover:text-white transition-colors"
                      >
                        Marcar contatado
                      </button>
                    </div>
                  </div>
                ))}

                {novosQuentes.length === 0 && (
                  <div className="col-span-2 py-6 text-center text-xs text-muted-foreground">
                    Nenhuma empresa nova pendente. Realize uma busca no Maps para alimentar sua fila!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Coluna Direita (4 colunas): Status do Banco & Sua Semana */}
          <div className="space-y-6 lg:col-span-4">
            {/* Card Saldo da Máquina Local */}
            <div className="space-y-4 rounded-2xl border border-white/[0.08] bg-[#12131a] p-5 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Base de Leads
                </span>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  Ilimitado Local
                </span>
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white tracking-tight">
                    {totalLeads}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">empresas no CRM</span>
                </div>

                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-400"
                    style={{ width: `${Math.min(100, Math.max(10, (totalLeads / 500) * 100))}%` }}
                  />
                </div>
              </div>

              <p className="text-[11px] leading-relaxed text-muted-foreground/80">
                ℹ️ <strong>CadêWeb roda 100% na sua máquina</strong>: sem mensalidade por lead extraído nem limites artificiais de crédito.
              </p>
            </div>

            {/* Card Sua Semana (Funil de Vendas Limpo) */}
            <div className="space-y-4 rounded-2xl border border-white/[0.08] bg-[#12131a] p-5 shadow-xl">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Sua Semana
                </span>
                <p className="text-[11px] text-muted-foreground mt-0.5">Desempenho dos últimos 7 dias</p>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-2.5">
                  <span className="text-lg font-extrabold text-white">{contatadosQtd}</span>
                  <p className="text-[10px] text-muted-foreground mt-1 truncate">Contatadas</p>
                </div>
                <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-2.5">
                  <span className="text-lg font-extrabold text-violet-400">{responderamQtd}</span>
                  <p className="text-[10px] text-muted-foreground mt-1 truncate">Avançaram</p>
                </div>
                <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-2.5">
                  <span className="text-lg font-extrabold text-amber-400">
                    {Math.round(responderamQtd * 0.4)}
                  </span>
                  <p className="text-[10px] text-muted-foreground mt-1 truncate">Reuniões</p>
                </div>
                <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-2.5">
                  <span className="text-lg font-extrabold text-emerald-400">{fechadasQtd}</span>
                  <p className="text-[10px] text-muted-foreground mt-1 truncate">Fechadas</p>
                </div>
              </div>
            </div>

            {/* Banner Rápido: Modo Foco */}
            <div className="relative overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-950/40 via-[#13141f] to-purple-950/20 p-5 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-bold text-violet-300">
                <Sparkles className="size-4 text-violet-400" />
                <span>Modo Foco Ativo</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mt-2">
                Dispare abordagens em ritmo acelerado: um lead por vez, do mais quente ao mais frio.
              </p>
              <Button
                asChild
                className="mt-4 w-full bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-md shadow-violet-600/30"
              >
                <Link to="/sessao">
                  Entrar na Sessão de Prospecção
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Primeiro Contato com Frameworks */}
      <ModalPrimeiroContato
        lead={leadPrimeiroContato}
        aberto={Boolean(leadPrimeiroContato)}
        onFechar={() => setLeadPrimeiroContato(null)}
      />
    </AppLayout>
  )
}
