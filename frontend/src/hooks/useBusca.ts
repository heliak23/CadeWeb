import { useCallback, useEffect, useRef, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { buscaService } from "@/services/buscaService"
import { useInvalidarLeads } from "@/hooks/useInvalidarLeads"
import { notificar, pedirPermissaoNotificacao } from "@/hooks/useNotificacaoNavegador"
import { tocarSom } from "@/hooks/useSom"
import type { AreaBuscaPayload, EstadoBusca } from "@/types/busca"

export function useBusca() {
  const queryClient = useQueryClient()
  const invalidarListaEMetricas = useInvalidarLeads()
  const [poll, setPoll] = useState(false)
  const [resultadoFinal, setResultadoFinal] = useState<EstadoBusca | null>(null)
  // Guarda se o polling já observou o backend em execução (rodando: true) nesta busca.
  // Isso impede que um estado residual cacheado (rodando: false) finalize a busca prematuramente.
  const viuRodandoRef = useRef(false)

  const aoDisparar = () => {
    setResultadoFinal(null)
    viuRodandoRef.current = false
    // Define explicitamente o estado inicial como rodando, sobrescrevendo qualquer cache anterior
    queryClient.setQueryData<EstadoBusca>(["busca-status"], {
      rodando: true,
      etapa: "",
      mensagem: "Iniciando busca...",
      empresas_encontradas: 0,
      empresas_processadas: 0,
      area_atual: 0,
      total_areas: 0,
    })
    setPoll(true)
    pedirPermissaoNotificacao()
  }

  const dispararBusca = useMutation({
    mutationFn: (queries: string) => buscaService.disparar(queries),
    onSuccess: aoDisparar,
  })

  const dispararBuscaMapa = useMutation({
    mutationFn: ({ nichos, areas }: { nichos: string[]; areas: AreaBuscaPayload[] }) =>
      buscaService.dispararPorMapa(nichos, areas),
    onSuccess: aoDisparar,
  })

  const statusBusca = useQuery({
    queryKey: ["busca-status"],
    queryFn: buscaService.consultarStatus,
    enabled: poll,
    refetchInterval: (query) => (query.state.data?.rodando ? 2000 : false),
    refetchIntervalInBackground: true,
  })

  useEffect(() => {
    if (!poll || !statusBusca.data) return

    if (statusBusca.data.rodando) {
      viuRodandoRef.current = true
      return
    }

    // Só finaliza quando a busca de fato começou e terminou (rodando: false após ter rodado)
    if (viuRodandoRef.current && !statusBusca.data.rodando) {
      setPoll(false)
      viuRodandoRef.current = false
      setResultadoFinal(statusBusca.data)
      queryClient.invalidateQueries({ queryKey: ["nichos"] })
      invalidarListaEMetricas()
      notificar("Busca de leads concluída", statusBusca.data.mensagem)
      tocarSom("busca-maps-concluida")
    }
  }, [poll, statusBusca.data, queryClient, invalidarListaEMetricas])

  const limparResultado = useCallback(() => {
    setResultadoFinal(null)
  }, [])

  return {
    dispararBusca,
    dispararBuscaMapa,
    statusBusca,
    pollingAtivo: poll,
    resultadoFinal,
    limparResultado,
  }
}
