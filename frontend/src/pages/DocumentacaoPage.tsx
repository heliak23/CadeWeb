import { useState } from "react"
import { Link } from "react-router-dom"
import {
  ArrowLeft,
  BookOpen,
  HelpCircle,
  Info,
  LayoutDashboard,
  MapPin,
  Settings,
  User,
} from "lucide-react"
import { AppLayout } from "@/components/layout/AppLayout"
import { InstagramIcon } from "@/components/icons/InstagramIcon"
import { cn } from "@/lib/utils"
import { VisaoGeralDoc } from "@/components/documentacao/secoes/VisaoGeralDoc"
import { GoogleMapsDoc } from "@/components/documentacao/secoes/GoogleMapsDoc"
import { InstagramDoc } from "@/components/documentacao/secoes/InstagramDoc"
import { DashboardDoc } from "@/components/documentacao/secoes/DashboardDoc"
import { ConfiguracoesDoc } from "@/components/documentacao/secoes/ConfiguracoesDoc"
import { InstalacaoDoc } from "@/components/documentacao/secoes/InstalacaoDoc"
import { FaqDoc } from "@/components/documentacao/secoes/FaqDoc"
import { SobreDoc } from "@/components/documentacao/secoes/SobreDoc"

const TOPICOS = [
  { id: "visao-geral", label: "Visão geral", icone: Info, Conteudo: VisaoGeralDoc },
  { id: "google-maps", label: "Google Maps", icone: MapPin, Conteudo: GoogleMapsDoc },
  { id: "instagram", label: "Instagram", icone: InstagramIcon, Conteudo: InstagramDoc },
  { id: "dashboard", label: "Dashboard geral", icone: LayoutDashboard, Conteudo: DashboardDoc },
  { id: "configuracoes", label: "Configurações de API", icone: Settings, Conteudo: ConfiguracoesDoc },
  { id: "instalacao", label: "Instalação e requisitos", icone: BookOpen, Conteudo: InstalacaoDoc },
  { id: "faq", label: "Perguntas comuns", icone: HelpCircle, Conteudo: FaqDoc },
  { id: "sobre", label: "Sobre / Contato", icone: User, Conteudo: SobreDoc },
] as const

export function DocumentacaoPage() {
  const [topicoAtivo, setTopicoAtivo] = useState<string>(TOPICOS[0].id)
  const topico = TOPICOS.find((t) => t.id === topicoAtivo) ?? TOPICOS[0]
  const Conteudo = topico.Conteudo

  return (
    <AppLayout breadcrumb="Guia & Documentação">
      <div className="mx-auto w-full max-w-6xl">
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Voltar para o dashboard
        </Link>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[220px_1fr]">
          <nav className="h-fit space-y-0.5 rounded-2xl border border-white/[0.08] bg-[#12131a] p-2 shadow-xl md:sticky md:top-20">
            {TOPICOS.map(({ id, label, icone: Icone }) => (
              <button
                key={id}
                onClick={() => setTopicoAtivo(id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors",
                  id === topicoAtivo
                    ? "bg-violet-600/20 text-violet-300 font-semibold border border-violet-500/30"
                    : "text-muted-foreground hover:bg-white/[0.04] hover:text-white"
                )}
              >
                <Icone className="size-4 shrink-0" />
                {label}
              </button>
            ))}
          </nav>

          <div className="rounded-2xl border border-white/[0.08] bg-[#12131a] p-6 shadow-xl">
            <Conteudo />
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
