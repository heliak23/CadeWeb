import { useEffect, useState } from "react"

export type Tema = "light" | "dark"

function temaInicial(): Tema {
  const salvo = localStorage.getItem("tema") as Tema | null
  if (salvo === "light" || salvo === "dark") return salvo
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

export function useTema() {
  const [tema, setTemaState] = useState<Tema>(temaInicial)

  useEffect(() => {
    // Aplica o tema no <html>
    document.documentElement.classList.toggle("dark", tema === "dark")
    localStorage.setItem("tema", tema)

    // Listener para sincronizar entre múltiplos componentes (ex: Header e Configurações)
    const onTemaAlterado = (e: Event) => {
      const customEvent = e as CustomEvent<Tema>
      if (customEvent.detail && (customEvent.detail === "light" || customEvent.detail === "dark")) {
        setTemaState(customEvent.detail)
      }
    }

    window.addEventListener("cadeweb-tema-alterado", onTemaAlterado)
    return () => {
      window.removeEventListener("cadeweb-tema-alterado", onTemaAlterado)
    }
  }, [tema])

  const mudarTema = (novoTema: Tema) => {
    document.documentElement.classList.toggle("dark", novoTema === "dark")
    localStorage.setItem("tema", novoTema)
    setTemaState(novoTema)
    window.dispatchEvent(
      new CustomEvent<Tema>("cadeweb-tema-alterado", { detail: novoTema })
    )
  }

  const alternar = () => mudarTema(tema === "dark" ? "light" : "dark")

  return { tema, alternar, mudarTema, setTema: mudarTema }
}

