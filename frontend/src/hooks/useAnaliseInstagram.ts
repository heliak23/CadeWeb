import { useCallback, useEffect, useRef, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { instagramService } from "@/services/instagramService"
import { tocarSom } from "@/hooks/useSom"
import type { EstadoAnaliseInstagram } from "@/types/instagram"

export function useAnaliseInstagram() {
  const queryClient = useQueryClient()
  const [poll, setPoll] = useState(false)
  const [resultadoFinal, setResultadoFinal] = useState<EstadoAnaliseInstagram | null>(
    null
  )
  const viuRodandoRef = useRef(false)

  const aoDisparar = () => {
    setResultadoFinal(null)
    viuRodandoRef.current = false
    queryClient.setQueryData<EstadoAnaliseInstagram>(["instagram-status"], {
      rodando: true,
      etapa: "",
      mensagem: "Iniciando análise...",
      perfis_encontrados: 0,
      perfis_processados: 0,
      post_id: null,
    })
    setPoll(true)
  }

  const dispararAnalise = useMutation({
    mutationFn: ({ postUrl, nichoAlvo }: { postUrl: string; nichoAlvo?: string }) =>
      instagramService.analisar(postUrl, nichoAlvo),
    onSuccess: aoDisparar,
  })

  const retomarAnalise = useMutation({
    mutationFn: (postId: number) => instagramService.retomarAnalise(postId),
    onSuccess: aoDisparar,
  })

  const statusAnalise = useQuery({
    queryKey: ["instagram-status"],
    queryFn: instagramService.consultarStatus,
    enabled: poll,
    refetchInterval: (query) => (query.state.data?.rodando ? 2000 : false),
    refetchIntervalInBackground: true,
  })

  useEffect(() => {
    if (!poll || !statusAnalise.data) return

    if (statusAnalise.data.rodando) {
      viuRodandoRef.current = true
      return
    }

    if (viuRodandoRef.current && !statusAnalise.data.rodando) {
      setPoll(false)
      viuRodandoRef.current = false
      setResultadoFinal(statusAnalise.data)
      queryClient.invalidateQueries({ queryKey: ["instagram-posts"] })
      tocarSom("analise-instagram-concluida")
    }
  }, [poll, statusAnalise.data, queryClient])

  const limparResultado = useCallback(() => {
    setResultadoFinal(null)
  }, [])

  return {
    dispararAnalise,
    retomarAnalise,
    statusAnalise,
    pollingAtivo: poll,
    resultadoFinal,
    limparResultado,
  }
}
