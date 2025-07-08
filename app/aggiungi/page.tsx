"use client"

import { useState } from "react"

interface Bivacco {
  nome: string
  localita: string
  sentiero: string
  altezza: number
  capienza: number
  descrizione: string
  latitudine: number
  longitudine: number
}

interface Percorso {
  nome: string
  localita: string
  sentiero: string
  difficolta: string
  pendenza_massima: string
  lunghezza: string
}

export default function AddPage() {
  const [view, setView] = useState<"bivacco" | "percorso" | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [bivacco, setBivacco] = useState<Bivacco>({
    nome: "",
    localita: "",
    sentiero: "",
    altezza: 0,
    capienza: 0,
    descrizione: "",
    latitudine: 0,
    longitudine: 0,
  })

  const [percorso, setPercorso] = useState<Percorso>({
    nome: "",
    localita: "",
    sentiero: "",
    difficolta: "",
    pendenza_massima: "",
    lunghezza: "",
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    const url = view === "bivacco" ? "http://localhost:5000/api/bivacchi" : "http://localhost:5000/api/percorsi"
    const data = view === "bivacco" ? bivacco : percorso

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        setError(result.message || "Errore durante l'aggiunta.")
        return
      }

      setSuccess(`${view === "bivacco" ? "Bivacco" : "Percorso"} aggiunto con successo!`)
      setBivacco({
        nome: "",
        localita: "",
        sentiero: "",
        altezza: 0,
        capienza: 0,
        descrizione: "",
        latitudine: 0,
        longitudine: 0,
      })
      setPercorso({
        nome: "",
        localita: "",
        sentiero: "",
        difficolta: "",
        pendenza_massima: "",
        lunghezza: "",
      })
    } catch (err) {
      console.error(err)
      setError("Errore di rete o del server.")
    }
  }

  return (
    <div className="Aggiungi-Container">
      {!view ? (
        <div className="view-selector">
          <h1>Inserisci un bivacco o un percorso:</h1>
          <button className="btnlog" onClick={() => setView("bivacco")}>Aggiungi Bivacco</button>
          <button className="btnlog" onClick={() => setView("percorso")}>Aggiungi Percorso</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <fieldset>
            <header>
              <h1>{view === "bivacco" ? "Nuovo Bivacco" : "Nuovo Percorso"}</h1>
              <h4>Inserisci i dati richiesti</h4>
            </header>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {success && <p style={{ color: "green" }}>{success}</p>}

            {/* BIVACCO FORM */}
            {view === "bivacco" ? (
              <>
                <input type="text" placeholder="Nome" value={bivacco.nome} onChange={e => setBivacco({ ...bivacco, nome: e.target.value })} required />
                <input type="text" placeholder="Località" value={bivacco.localita} onChange={e => setBivacco({ ...bivacco, localita: e.target.value })} required />
                <input type="text" placeholder="Sentiero" value={bivacco.sentiero} onChange={e => setBivacco({ ...bivacco, sentiero: e.target.value })} required />
                <input type="number" placeholder="Altezza" value={bivacco.altezza} onChange={e => setBivacco({ ...bivacco, altezza: Number(e.target.value) })} required />
                <input type="number" placeholder="Capienza" value={bivacco.capienza} onChange={e => setBivacco({ ...bivacco, capienza: Number(e.target.value) })} required />
                <input type="text" placeholder="Descrizione" value={bivacco.descrizione} onChange={e => setBivacco({ ...bivacco, descrizione: e.target.value })} required />
                <input type="number" placeholder="Latitudine" value={bivacco.latitudine} onChange={e => setBivacco({ ...bivacco, latitudine: Number(e.target.value) })} required />
                <input type="number" placeholder="Longitudine" value={bivacco.longitudine} onChange={e => setBivacco({ ...bivacco, longitudine: Number(e.target.value) })} required />
              </>
            ) : (
              <>
                <input type="text" placeholder="Nome" value={percorso.nome} onChange={e => setPercorso({ ...percorso, nome: e.target.value })} required />
                <input type="text" placeholder="Località" value={percorso.localita} onChange={e => setPercorso({ ...percorso, localita: e.target.value })} required />
                <input type="text" placeholder="Sentiero" value={percorso.sentiero} onChange={e => setPercorso({ ...percorso, sentiero: e.target.value })} required />
                <input type="text" placeholder="Difficoltà" value={percorso.difficolta} onChange={e => setPercorso({ ...percorso, difficolta: e.target.value })} required />
                <input type="text" placeholder="Pendenza Massima" value={percorso.pendenza_massima} onChange={e => setPercorso({ ...percorso, pendenza_massima: e.target.value })} required />
                <input type="text" placeholder="Lunghezza" value={percorso.lunghezza} onChange={e => setPercorso({ ...percorso, lunghezza: e.target.value })} required />
              </>
            )}

            <button type="submit" className="btnlog">Aggiungi</button>
            <footer>
              <p><a href="#" onClick={() => setView(null)}>Torna indietro</a></p>
            </footer>
          </fieldset>
        </form>
      )}
    </div>
  )
}
