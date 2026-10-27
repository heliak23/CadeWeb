import { Link, useLocation } from "react-router-dom"
import {
  CalendarDays,
  Building2,
  Zap,
  BarChart3,
  Settings,
  Sparkles,
  Search,
  BookOpen,
  ChevronRight,
  ShieldCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { InstagramIcon } from "@/components/icons/InstagramIcon"

interface SidebarProps {
  onNovaBusca?: () => void
}

export function Sidebar({ onNovaBusca }: SidebarProps) {
  const location = useLocation()
  const pathname = location.pathname

  const navItems = [
    {
      to: "/",
      label: "Hoje",
      icon: CalendarDays,
      badge: null,
      active: pathname === "/" || pathname === "/tarefas",
    },
    {
      to: "/leads",
      label: "Empresas",
      icon: Building2,
      badge: null,
      active: pathname === "/leads",
    },
    {
      to: "/sessao",
      label: "Sessão foco",
      icon: Zap,
      badge: "Modo foco",
      active: pathname === "/sessao",
    },
    {
      to: "/instagram",
      label: "Instagram",
      icon: InstagramIcon,
      badge: null,
      active: pathname.startsWith("/instagram"),
    },
    {
      to: "/analytics",
      label: "Analytics",
      icon: BarChart3,
      badge: null,
      active: pathname === "/analytics",
    },
    {
      to: "/documentacao",
      label: "Guia & Copy",
      icon: BookOpen,
      badge: null,
      active: pathname === "/documentacao",
    },
  ]

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border/40 bg-card/60 backdrop-blur-xl md:flex">
      {/* Brand & Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border/40 px-5">
        <div className="relative flex size-9 items-center justify-center rounded-xl overflow-hidden shadow-md shadow-violet-500/20 ring-1 ring-violet-400/30">
          <img src="/cadeweb-icon.png" alt="CadêWeb" className="size-full object-cover" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-extrabold tracking-tight text-foreground">
              Cadê<span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">Web</span>
            </span>
            <span className="rounded-full bg-violet-500/10 px-1.5 py-0.2 text-[10px] font-semibold text-violet-400 border border-violet-500/20">
              PRO
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground/80 font-medium">Prospecção & Sites</span>
        </div>
      </div>

      {/* User / Workspace Card */}
      <div className="p-3">
        <div className="flex items-center justify-between rounded-xl border border-border/50 bg-background/50 p-2.5 transition-colors hover:border-violet-500/30">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-violet-500/20 to-purple-500/20 text-xs font-semibold text-violet-300 ring-1 ring-violet-500/30">
              PRO
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-foreground">Workspace Principal</p>
              <div className="flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] text-muted-foreground">Base Local Ativa</p>
              </div>
            </div>
          </div>
          <ChevronRight className="size-4 text-muted-foreground/60 shrink-0" />
        </div>
      </div>

      {/* Quick Action: Nova Busca */}
      <div className="px-3 pb-2">
        <button
          type="button"
          onClick={onNovaBusca}
          className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 px-3.5 py-2.5 text-xs font-bold text-neutral-950 shadow-md shadow-amber-500/15 transition-all hover:brightness-105 hover:shadow-amber-500/25 active:scale-[0.98]"
        >
          <Search className="size-4 stroke-[2.5]" />
          <span>Nova Busca no Maps</span>
          <Sparkles className="size-3 text-amber-900 transition-transform group-hover:rotate-12" />
        </button>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        <div className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          Menu Principal
        </div>
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "group relative flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all",
                item.active
                  ? "bg-gradient-to-r from-violet-600/15 via-purple-600/10 to-transparent text-violet-400 border-l-2 border-violet-500 font-semibold"
                  : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={cn(
                    "size-4 shrink-0 transition-colors",
                    item.active ? "text-violet-400" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="rounded-full bg-violet-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-violet-400 border border-violet-500/20">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      {/* Bottom Footer / Settings */}
      <div className="border-t border-border/40 p-3 space-y-1">
        <Link
          to="/configuracoes"
          className={cn(
            "flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors",
            pathname === "/configuracoes"
              ? "bg-accent text-foreground font-semibold"
              : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
          )}
        >
          <Settings className="size-4 shrink-0" />
          <span>Configurações & APIs</span>
        </Link>
        <div className="flex items-center gap-2 px-3 py-1.5 text-[10px] text-muted-foreground/60">
          <ShieldCheck className="size-3.5 text-emerald-500" />
          <span>DPAPI Vault Protegido</span>
        </div>
      </div>
    </aside>
  )
}
