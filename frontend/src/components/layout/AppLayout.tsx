import { useState, type ReactNode } from "react"
import { useLocation } from "react-router-dom"
import { Plus, Search } from "lucide-react"
import { Sidebar } from "@/components/layout/Sidebar"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { NovaBuscaModal } from "@/components/search-modal/NovaBuscaModal"
import { BuscaFloatingIndicator } from "@/components/search-modal/BuscaFloatingIndicator"
import { useBusca } from "@/hooks/useBusca"
import { useAtalhosTeclado } from "@/hooks/useAtalhosTeclado"

interface AppLayoutProps {
  children: ReactNode
  breadcrumb?: string
  acoesHeader?: ReactNode
}

export function AppLayout({ children, breadcrumb, acoesHeader }: AppLayoutProps) {
  const [modalBuscaAberto, setModalBuscaAberto] = useState(false)
  const [buscaMinimizada, setBuscaMinimizada] = useState(false)
  const busca = useBusca()
  const location = useLocation()

  useAtalhosTeclado({
    onNovaBusca: () => setModalBuscaAberto(true),
  })

  // Obtém nome da seção para o breadcrumb se não informado
  const secaoAtual = (() => {
    if (breadcrumb) return breadcrumb
    const path = location.pathname
    if (path === "/" || path === "/tarefas") return "Hoje"
    if (path === "/leads") return "Empresas"
    if (path === "/sessao") return "Sessão de Prospecção"
    if (path.startsWith("/instagram")) return "Instagram"
    if (path === "/analytics") return "Analytics"
    if (path === "/configuracoes") return "Configurações"
    if (path === "/documentacao") return "Documentação"
    return "CadêWeb"
  })()

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-150">
      {/* Sidebar Lateral */}
      <Sidebar onNovaBusca={() => setModalBuscaAberto(true)} />

      {/* Área de Conteúdo Principal */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Header Barra Superior */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6 transition-colors">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className="font-semibold text-foreground">{secaoAtual}</span>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-muted-foreground">CadêWeb</span>
          </div>

          <div className="flex items-center gap-2.5">
            {acoesHeader}

            <button
              type="button"
              onClick={() => setModalBuscaAberto(true)}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-300 transition-colors hover:bg-amber-500/20 active:scale-95"
            >
              <Plus className="size-3.5 stroke-[2.5]" />
              <span>Nova busca</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const event = new KeyboardEvent("keydown", {
                  key: "k",
                  metaKey: true,
                  ctrlKey: true,
                  bubbles: true,
                })
                document.dispatchEvent(event)
              }}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card/60 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-violet-500/40 hover:text-foreground"
              title="Busca global (Ctrl + K)"
            >
              <Search className="size-3" />
              <span className="hidden md:inline">Buscar</span>
              <kbd className="rounded border border-border bg-muted/60 px-1 py-0.5 text-[10px] font-mono text-muted-foreground">
                ⌘K
              </kbd>
            </button>

            <ThemeToggle />
          </div>
        </header>

        {/* Conteúdo Dinâmico */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 md:px-8">
          {children}
        </main>
      </div>

      {/* Modal Global de Nova Busca */}
      <NovaBuscaModal
        aberto={modalBuscaAberto && !buscaMinimizada}
        onFechar={() => setModalBuscaAberto(false)}
        onMinimizar={() => setBuscaMinimizada(true)}
        busca={busca}
      />

      {buscaMinimizada && busca.statusBusca.data && (
        <BuscaFloatingIndicator
          mensagem={busca.statusBusca.data.mensagem}
          onClick={() => setBuscaMinimizada(false)}
        />
      )}
    </div>
  )
}
