import { useEffect, useState } from "react"
import { Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { EstadoBusca } from "@/types/busca"

interface BuscaProgressProps {
  estado: EstadoBusca
}

export function BuscaProgress({ estado }: BuscaProgressProps) {
  const [segundos, setSegundos] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setSegundos((s) => s + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const percentual =
    estado.empresas_encontradas > 0
      ? Math.min(
          100,
          Math.round(
            (estado.empresas_processadas / estado.empresas_encontradas) * 100
          )
        )
      : 0

  const etapas = [
    {
      titulo: "Preparando busca e filtros",
      descricao: "Configurando área geográfica e parâmetros de busca.",
      concluida: true,
      ativa: false,
    },
    {
      titulo: "Lendo o Google Maps",
      descricao: "Percorremos a região atrás das empresas do nicho selecionado.",
      concluida: estado.etapa === "verificando_sites" || estado.empresas_encontradas > 0,
      ativa: estado.etapa === "scraping",
    },
    {
      titulo: "Analisando cada empresa",
      descricao: "Verificamos presença de site, HTTPS, mobile, lentidão e raio-X.",
      concluida: percentual === 100,
      ativa: estado.etapa === "verificando_sites",
    },
    {
      titulo: "Salvando no seu CRM",
      descricao: "Calculando scores de prioridade e organizando no funil.",
      concluida: false,
      ativa: estado.etapa === "verificando_sites" && percentual > 90,
    },
  ]

  return (
    <div className="space-y-6 rounded-2xl border border-white/[0.08] bg-[#0d0e14] p-5 text-white shadow-2xl">
      {/* Radar Sonar Visual */}
      <div className="relative mx-auto flex h-52 w-full max-w-md items-center justify-center overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-b from-[#13141f] to-[#0a0a10]">
        {/* Anéis Concêntricos do Radar */}
        <div className="absolute size-44 rounded-full border border-violet-500/15" />
        <div className="absolute size-32 rounded-full border border-violet-500/20" />
        <div className="absolute size-20 rounded-full border border-violet-500/30" />
        <div className="absolute size-8 rounded-full border border-violet-500/40" />

        {/* Retículos / Linhas em Cruz */}
        <div className="absolute h-full w-[1px] bg-violet-500/10" />
        <div className="absolute h-[1px] w-full bg-violet-500/10" />

        {/* Feixe Giratório do Sonar */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="size-48 origin-center rounded-full animate-spin"
            style={{
              animationDuration: "3.5s",
              background:
                "conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(139, 92, 246, 0.4) 360deg)",
            }}
          />
        </div>

        {/* Ponto Central e Blips Detectados */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative flex size-3 items-center justify-center">
            <span className="absolute size-6 animate-ping rounded-full bg-amber-400/40" />
            <span className="size-2.5 rounded-full bg-amber-400 shadow-lg shadow-amber-400" />
          </div>
          <span className="mt-2 text-center text-xs font-bold text-white tracking-wide">
            {estado.empresas_encontradas > 0
              ? `${estado.empresas_processadas} de ${estado.empresas_encontradas} empresas`
              : "Varrendo Google Maps..."}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {estado.area_atual > 0
              ? `Área ${estado.area_atual} de ${estado.total_areas}`
              : "Identificando oportunidades"}
          </span>
        </div>

        {/* Blips aleatórios que piscam quando há empresas encontradas */}
        {estado.empresas_encontradas > 0 && (
          <>
            <div className="absolute top-10 left-16 size-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
            <div className="absolute bottom-12 right-20 size-2 rounded-full bg-violet-400 animate-ping shadow-sm shadow-violet-400" />
            <div className="absolute top-14 right-24 size-1.5 rounded-full bg-amber-300" />
          </>
        )}
      </div>

      {/* Stepper Transparente: O que está acontecendo */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            O que está acontecendo
          </span>
          <span className="text-xs font-mono text-violet-400">
            {segundos} s decorridos
          </span>
        </div>

        <div className="space-y-2.5">
          {etapas.map((etapa, idx) => (
            <div
              key={idx}
              className={cn(
                "flex items-start gap-3 rounded-xl border p-2.5 transition-all text-xs",
                etapa.ativa
                  ? "border-violet-500/40 bg-violet-600/10 shadow-sm"
                  : etapa.concluida
                  ? "border-white/[0.04] bg-white/[0.01] text-muted-foreground"
                  : "border-transparent opacity-40"
              )}
            >
              <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full">
                {etapa.concluida ? (
                  <Check className="size-3.5 text-emerald-400" />
                ) : etapa.ativa ? (
                  <Loader2 className="size-3.5 animate-spin text-violet-400" />
                ) : (
                  <span className="size-1.5 rounded-full bg-white/20" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className={cn("font-medium", etapa.ativa ? "text-white font-semibold" : "")}>
                  {etapa.titulo}
                </p>
                <p className="text-[11px] text-muted-foreground/80 leading-relaxed mt-0.5">
                  {etapa.descricao}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="pt-2 text-center text-[11px] text-muted-foreground/60">
          Buscas costumam levar de 1 a 3 minutos. O radar analisa cada empresa em tempo real.
        </p>
      </div>
    </div>
  )
}
