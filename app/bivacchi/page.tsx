// app/bivacchi/page.tsx
"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import "../../styles/bivacchi.css"

interface Bivacco {
  _id: string
  nome: string
  localita: string
  sentiero: string
  altezza: number
  capienza: number
  descrizione: string
  latitudine: number
  longitudine: number
}

export default function BivacchiPage() {
  const [bivacchi, setBivacchi] = useState<Bivacco[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [liked, setLiked] = useState<{ [id: string]: boolean }>({})

  useEffect(() => {
    fetch("http://localhost:5000/api/bivacchi")
      .then((res) => res.json())
      .then(setBivacchi)
      .catch((err) => alert("Errore caricamento dati"))

    const stored = localStorage.getItem("likedBivacchi")
    if (stored) setLiked(JSON.parse(stored))
  }, [])

  const toggleLike = (id: string) => {
    setLiked((prev) => {
      const updated = { ...prev, [id]: !prev[id] }
      localStorage.setItem("likedBivacchi", JSON.stringify(updated))
      return updated
    })
  }

  const filtered = bivacchi.filter((b) =>
    b.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="bivacchi-container">
      <h1 className="bivacchi-title">Elenco dei Bivacchi</h1>

      <div className="search-container">
        <input
          type="text"
          placeholder="Cerca un bivacco..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="bivacchi-grid">
        {filtered.map((b) => (
          <div key={b._id} className="bivacco-card">
            <div className="bivacco-header">
              <h2>{b.nome}</h2>
              <Image
                src={liked[b._id] ? "/heart2.png" : "/heart.png"}
                alt="Like"
                width={25}
                height={25}
                className="heart-icon"
                onClick={() => toggleLike(b._id)}
              />
            </div>
            <p><strong>Località:</strong> {b.localita}</p>
            <p><strong>Sentiero:</strong> {b.sentiero}</p>
            <p><strong>Altezza:</strong> {b.altezza} m</p>
            <p><strong>Capienza:</strong> {b.capienza} persone</p>
            <p><strong>Descrizione:</strong> {b.descrizione}</p>
            <p><strong>Coordinate:</strong> {b.latitudine}, {b.longitudine}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
