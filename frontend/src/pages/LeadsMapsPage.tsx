import { useEffect, useRef, useState } from "react"
import { Download } from "lucide-react"
import { AppLayout } from "@/components/layout/AppLayout"
import { Button } from "@/components/ui/button"
import { LeadFilterBar } from "@/components/filters/LeadFilterBar"
import { LeadGrid } from "@/components/leads/LeadGrid"
import { LeadDetailDrawer } from "@/components/lead-detail/LeadDetailDrawer"
import { ModalPrimeiroContato } from "@/components/leads/ModalPrimeiroContato"
import { useFiltrosLeads } from "@/hooks/useFiltrosLeads"
import { useLeads } from "@/hooks/useLeads"
import { useAtalhosTeclado } from "@/hooks/useAtalhosTeclado"
import { urlExportarCsv } from "@/services/leadsService"
import type { Lead } from "@/types/lead"

export function LeadsMapsPage() {
  const { filtros, setFiltros, limpar, filtrosEmUso } = useFiltrosLeads()
  const buscaInputRef = useRef<HTMLInputElement>(null)
  const [placeIdSelecionado, setPlaceIdSelecionado] = useState<string | null>(null)
  const [leadPrimeiroContato, setLeadPrimeiroContato] = useState<Lead | null>(null)

  const { leads } = useLeads(filtros)
  const [leadSelecionado, setLeadSelecionado] = useState<Lead | null>(null)

  useEffect(() => {
    if (placeIdSelecionado === null) {
      setLeadSelecionado(null)
      return
    }
    const atual = leads.find((l) => l.place_id === placeIdSelecionado)
    if (atual) setLeadSelecionado(atual)
  }, [placeIdSelecionado, leads])

  useAtalhosTeclado({
    onFocarBusca: () => buscaInputRef.current?.focus(),
  })

  return (
    <AppLayout
      breadcrumb="Empresas (CRM)"
      acoesHeader={
        <Button
          variant="outline"
          size="sm"
          asChild
          className="h-8 border-white/10 bg-white/[0.03] text-xs text-white hover:bg-white/10"
        >
          <a href={urlExportarCsv(filtros)}>
            <Download className="size-3.5" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </a>
        </Button>
      }
    >
      <div className="w-full space-y-4">
        {/* Barra de Filtros e Busca Rápida */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.06] bg-[#12131a] p-3 shadow-lg">
          <LeadFilterBar
            filtros={filtros}
            setFiltros={setFiltros}
            filtrosEmUso={filtrosEmUso}
            onLimpar={limpar}
            buscaInputRef={buscaInputRef}
          />
        </div>

        {/* Quadro Kanban e Lista de Leads */}
        <LeadGrid
          filtros={filtros}
          filtrosEmUso={filtrosEmUso}
          onLimparFiltros={limpar}
          onSelecionarLead={(lead) => setPlaceIdSelecionado(lead.place_id)}
          onAbrirPrimeiroContato={(lead) => setLeadPrimeiroContato(lead)}
        />
      </div>

      {/* Slide-Over Drawer de Detalhes do Lead */}
      <LeadDetailDrawer
        lead={leadSelecionado}
        aberto={Boolean(leadSelecionado)}
        onFechar={() => setPlaceIdSelecionado(null)}
        onAbrirPrimeiroContato={(lead) => {
          setPlaceIdSelecionado(null)
          setLeadPrimeiroContato(lead)
        }}
      />

      {/* Modal de Abordagem / Primeiro Contato com os 5 Frameworks */}
      <ModalPrimeiroContato
        lead={leadPrimeiroContato}
        aberto={Boolean(leadPrimeiroContato)}
        onFechar={() => setLeadPrimeiroContato(null)}
      />
    </AppLayout>
  )
}
