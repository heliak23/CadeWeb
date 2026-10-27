import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Star, MessageCircle, Copy, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { configService } from "@/services/configService"
import { linkWhatsappComMensagem } from "@/services/tarefasService"
import { conversaService } from "@/services/conversaService"
import { cn } from "@/lib/utils"
import type { Lead } from "@/types/lead"

interface ModalPrimeiroContatoProps {
  lead: Lead | null
  aberto: boolean
  onFechar: () => void
}

interface FrameworkAbordagem {
  id: string
  titulo: string
  estrelas: number
  descricao: string
  gerarTexto: (params: {
    nome: string
    nicho: string
    cidade: string
    vendedor: string
  }) => string
}

const FRAMEWORKS: FrameworkAbordagem[] = [
  {
    id: "duas_perguntas",
    titulo: "Duas perguntas",
    estrelas: 5,
    descricao: "Pergunta simples para iniciar a conversa.",
    gerarTexto: ({ nome, nicho, cidade, vendedor }) =>
      `Oi, ${nome}! Aqui é o ${vendedor || "especialista"}, trabalho com presença online e sites pra ${nicho || "empresas"} em ${cidade || "sua região"}.\n\nAntes de te mostrar qualquer coisa, uma dúvida rápida: hoje o cliente novo chega mais por indicação, Instagram ou Google?`,
  },
  {
    id: "duas_versoes",
    titulo: "Duas versões",
    estrelas: 4,
    descricao: "Use quando as duas versões e os prints já estiverem prontos.",
    gerarTexto: ({ nome, nicho, cidade, vendedor }) =>
      `Oi, ${nome}! Tudo bem? Sou o ${vendedor || "especialista"}, trabalho com páginas de alta conversão para ${nicho || "empresas"} em ${cidade || "sua cidade"}.\n\nMontei duas versões visuais de como ficaria a presença digital de vocês no Google para atrair novos clientes todo dia. Posso te mandar o print de 1 minuto pra você comparar?`,
  },
  {
    id: "cliente_misterioso",
    titulo: "Cliente misterioso",
    estrelas: 3,
    descricao: "Use apenas se a tentativa e o problema realmente aconteceram.",
    gerarTexto: ({ nome, nicho, cidade, vendedor }) =>
      `Olá, ${nome}! Aqui é o ${vendedor}. Fui pesquisar vocês no Google para ver tabela/serviços de ${nicho || "atendimento"} em ${cidade}, mas reparei que não tem um site oficial direto (só o endereço no mapa).\n\nAcabou me gerando dúvida se vocês ainda atendem no local. Vocês recebem outros clientes com essa mesma dúvida?`,
  },
  {
    id: "exclusividade",
    titulo: "Exclusividade na cidade",
    estrelas: 2,
    descricao: "Exige modelo pronto e compromisso real de exclusividade.",
    gerarTexto: ({ nome, nicho, cidade, vendedor }) =>
      `Oi, pessoal da ${nome}! Meu nome é ${vendedor}.\n\nEstou finalizando uma estrutura digital exclusiva para o segmento de ${nicho || "atendimento"} em ${cidade}.\n\nComo atendemos apenas 1 empresa parceira por região com exclusividade, queria validar se vocês têm interesse em absorver mais clientes este mês antes de abrir para outro local.`,
  },
  {
    id: "site_no_ar",
    titulo: "Site no ar com data pra sair",
    estrelas: 2,
    descricao: "Exige site publicado e retirada na data prometida.",
    gerarTexto: ({ nome, nicho, cidade, vendedor }) =>
      `Oi, ${nome}! Tudo bom? Sou ${vendedor}.\n\nCriei uma prévia interativa de página para ${nicho || "empresas"} como a ${nome} em ${cidade || "sua região"} com botão direto de WhatsApp e galeria otimizada para celular.\n\nDeixei no ar temporariamente até sexta-feira para vocês testarem. Posso te mandar o link pra você dar uma olhada sem compromisso?`,
  },
]

export function ModalPrimeiroContato({
  lead,
  aberto,
  onFechar,
}: ModalPrimeiroContatoProps) {
  const [frameworkId, setFrameworkId] = useState("duas_perguntas")
  const [nomeSaudacao, setNomeSaudacao] = useState("")
  const [nicho, setNicho] = useState("")
  const [cidade, setCidade] = useState("")
  const [nomeVendedor, setNomeVendedor] = useState("")
  const [mensagemCustomizada, setMensagemCustomizada] = useState("")

  const { data: perfil } = useQuery({
    queryKey: ["perfil-vendedor"],
    queryFn: configService.obterPerfilVendedor,
  })

  // Sincroniza dados do lead selecionado
  useEffect(() => {
    if (lead) {
      setNomeSaudacao(lead.nome || "")
      setNicho(lead.nicho || lead.categoria || "empresas locais")
      setCidade(lead.cidade || "")
      const vendedor = perfil?.nome || "Consultor"
      setNomeVendedor(vendedor)

      const fPadrao = FRAMEWORKS.find((f) => f.id === frameworkId) || FRAMEWORKS[0]
      setMensagemCustomizada(
        fPadrao.gerarTexto({
          nome: lead.nome || "",
          nicho: lead.nicho || lead.categoria || "empresas locais",
          cidade: lead.cidade || "",
          vendedor,
        })
      )
    }
  }, [lead, perfil, frameworkId])

  const trocarFramework = (novoId: string) => {
    setFrameworkId(novoId)
    const f = FRAMEWORKS.find((item) => item.id === novoId)
    if (f) {
      setMensagemCustomizada(
        f.gerarTexto({
          nome: nomeSaudacao,
          nicho,
          cidade,
          vendedor: nomeVendedor,
        })
      )
    }
  }

  const restaurarTexto = () => {
    const f = FRAMEWORKS.find((item) => item.id === frameworkId)
    if (f) {
      setMensagemCustomizada(
        f.gerarTexto({
          nome: nomeSaudacao,
          nicho,
          cidade,
          vendedor: nomeVendedor,
        })
      )
      toast.info("Texto restaurado para o padrão do framework.")
    }
  }

  const copiarTexto = async () => {
    await navigator.clipboard.writeText(mensagemCustomizada)
    toast.success("Mensagem copiada com sucesso!")
  }

  const abrirWhatsApp = () => {
    if (!lead) return

    conversaService.registrarLeadAtivo("maps", lead.place_id).catch(() => {})

    if (lead.whatsapp_link) {
      window.open(linkWhatsappComMensagem(lead.whatsapp_link, mensagemCustomizada), "_blank")
    } else if (lead.telefone) {
      const numLimpo = lead.telefone.replace(/\D/g, "")
      const link = `https://wa.me/55${numLimpo}?text=${encodeURIComponent(mensagemCustomizada)}`
      window.open(link, "_blank")
    } else {
      copiarTexto()
      toast.warning("Lead sem telefone cadastrado. A mensagem foi copiada para a área de transferência.")
    }
  }

  if (!lead) return null

  return (
    <Dialog open={aberto} onOpenChange={(open) => !open && onFechar()}>
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto border-border bg-card p-0 text-foreground shadow-2xl">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <span>Primeiro contato</span>
            <span className="text-xs font-normal text-muted-foreground">
              · Abordagem inteligente
            </span>
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Escolha uma abordagem para <strong className="text-foreground">{lead.nome}</strong>. Você confere a mensagem antes de enviá-la no WhatsApp.
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-12">
          {/* Coluna Esquerda: Frameworks */}
          <div className="space-y-2.5 md:col-span-5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Escolha a estratégia
            </Label>
            <div className="space-y-2">
              {FRAMEWORKS.map((f) => {
                const ativo = f.id === frameworkId
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => trocarFramework(f.id)}
                    className={cn(
                      "flex w-full flex-col items-start rounded-xl border p-3 text-left transition-all",
                      ativo
                        ? "border-violet-500 bg-violet-600/15 shadow-md shadow-violet-500/10 ring-1 ring-violet-500/50"
                        : "border-white/[0.07] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                    )}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className={cn("text-xs font-bold", ativo ? "text-violet-300" : "text-white")}>
                        {f.titulo}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "size-3",
                              i < f.estrelas
                                ? ativo
                                  ? "fill-violet-400 text-violet-400"
                                  : "fill-amber-400 text-amber-400"
                                : "text-white/20"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                      {f.descricao}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Coluna Direita: Personalização e Prévia */}
          <div className="space-y-4 md:col-span-7">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">Nome na saudação</Label>
                <Input
                  value={nomeSaudacao}
                  onChange={(e) => setNomeSaudacao(e.target.value)}
                  className="h-8 border-white/10 bg-white/[0.03] text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">Nicho da pesquisa</Label>
                <Input
                  value={nicho}
                  onChange={(e) => setNicho(e.target.value)}
                  className="h-8 border-white/10 bg-white/[0.03] text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">Cidade</Label>
                <Input
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  className="h-8 border-white/10 bg-white/[0.03] text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">Nome na mensagem</Label>
                <Input
                  value={nomeVendedor}
                  onChange={(e) => setNomeVendedor(e.target.value)}
                  className="h-8 border-white/10 bg-white/[0.03] text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-white">
                  Mensagem antes de abrir o WhatsApp
                </Label>
                <button
                  type="button"
                  onClick={restaurarTexto}
                  className="flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-white"
                >
                  <RotateCcw className="size-3" />
                  <span>Restaurar texto</span>
                </button>
              </div>

              <Textarea
                value={mensagemCustomizada}
                onChange={(e) => setMensagemCustomizada(e.target.value)}
                rows={6}
                className="resize-none border-border bg-muted/40 font-sans text-xs leading-relaxed text-foreground shadow-inner focus-visible:ring-violet-500"
              />
            </div>

            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="text-[11px] text-muted-foreground">
                A conversa abre com o texto preenchido; revise e envie por lá.
              </span>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copiarTexto}
                  className="border-border bg-card text-xs text-foreground hover:bg-muted"
                >
                  <Copy className="size-3.5" />
                  Copiar
                </Button>

                <Button
                  size="sm"
                  onClick={abrirWhatsApp}
                  className="bg-emerald-500 text-neutral-950 font-bold hover:bg-emerald-400 shadow-md shadow-emerald-500/20"
                >
                  <MessageCircle className="size-4" />
                  Abrir no WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
