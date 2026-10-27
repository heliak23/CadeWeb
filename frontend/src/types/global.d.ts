/** Ponte exposta pelo app de desktop (preload-app.js). Ausente no navegador. */
interface PonteCadeWeb {
  desktop: true
  versao: string | null
  aoReceber: (evento: string, callback: (dados: unknown) => void) => () => void
}

interface Window {
  cadeWeb?: PonteCadeWeb
  prospectOS?: PonteCadeWeb
}

