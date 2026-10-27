import type { ReactNode } from "react"
import { Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { StatusLead } from "@/types/lead"

interface ModalExcluirEmpresaProps {
  aberto?: boolean
  onOpenChange?: (aberto: boolean) => void
  trigger?: ReactNode
  nomeEmpresa: string
  status: StatusLead
  onExcluirDaLista: () => void
  onExcluirDefinitivamente?: () => void
}

export function ModalExcluirEmpresa({
  aberto,
  onOpenChange,
  trigger,
  nomeEmpresa,
  status,
  onExcluirDaLista,
  onExcluirDefinitivamente,
}: ModalExcluirEmpresaProps) {
  const ehIgnorado = status === "ignorado"

  return (
    <AlertDialog open={aberto} onOpenChange={onOpenChange}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-rose-500 mb-1">
            <Trash2 className="size-5 shrink-0" />
            <AlertDialogTitle className="text-left text-base font-bold text-foreground">
              {ehIgnorado
                ? `Excluir "${nomeEmpresa}" definitivamente?`
                : `Excluir "${nomeEmpresa}"?`}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="text-left text-xs leading-relaxed space-y-2 text-muted-foreground">
              {ehIgnorado ? (
                <p>
                  Esta ação apagará a empresa <strong>de vez do banco de dados SQLite</strong>.
                  Não é possível desfazer. Se você rodar uma nova busca nesta região, ela poderá voltar a aparecer.
                </p>
              ) : (
                <div className="space-y-2">
                  <p>Escolha como deseja remover esta empresa filtrada:</p>
                  <div className="rounded-lg border border-border/80 bg-muted/40 p-2.5 space-y-1 text-left">
                    <p className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-rose-500" />
                      Excluir da lista (Recomendado)
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Remove a empresa do seu funil e a arquiva para que <strong>nunca mais volte a aparecer</strong> em buscas futuras. Você também pode desfazer pelo aviso na tela.
                    </p>
                  </div>
                  {onExcluirDefinitivamente && (
                    <div className="rounded-lg border border-border/80 bg-muted/20 p-2.5 space-y-1 text-left">
                      <p className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                        <span className="size-1.5 rounded-full bg-amber-500" />
                        Excluir definitivamente
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Apaga completamente do banco de dados (ela poderá ser capturada em buscas futuras).
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-1.5 pt-2">
          <AlertDialogCancel className="text-xs h-8">Cancelar</AlertDialogCancel>

          {!ehIgnorado && onExcluirDefinitivamente && (
            <AlertDialogAction
              variant="outline"
              className="text-xs h-8 border-destructive/40 text-destructive hover:bg-destructive/10"
              onClick={onExcluirDefinitivamente}
            >
              Excluir do banco
            </AlertDialogAction>
          )}

          <AlertDialogAction
            variant="destructive"
            className="text-xs h-8 bg-rose-600 hover:bg-rose-700 text-white font-semibold"
            onClick={ehIgnorado && onExcluirDefinitivamente ? onExcluirDefinitivamente : onExcluirDaLista}
          >
            {ehIgnorado ? "Excluir definitivamente" : "Excluir da lista"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
