"use client"

import { useEffect, useState } from "react"
import { useAuth } from "../../context/AuthContext"
import Link from "next/link"
import Image from "next/image"
import "../../styles/profilo.css"

interface User {
  username?: string
  mail: string
  tesserato: boolean
  tesseraImg?: string
  preferiti: string[]
  postati: {
    titolo: string
    tipo: "bivacco" | "percorso"
    data: string
  }[]
}

export default function ProfiloUtentePage() {
  const { email } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!email) return
        const res = await fetch(`http://localhost:5000/api/utente/${email}`)
        if (!res.ok) throw new Error("Errore nella fetch del profilo utente")
        const data = await res.json()
        setUser(data.user)
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [email])

  if (isLoading) return <p>Caricamento profilo...</p>

  if (!user) {
    return (
      <div className="container">
        <h2>Utente non trovato</h2>
        <p>Devi essere loggato per vedere il tuo profilo.</p>
        <Link href="/login"><button className="btnlog">Login</button></Link>
      </div>
    )
  }

  return (
    <div className="container">
      <h1>👤 Profilo di {user.username || user.mail}</h1>

      <div className="profile-section">
        <p><strong>Email:</strong> {user.mail}</p>
        <p><strong>Tesserato:</strong> {user.tesserato ? "✅ Sì" : "❌ No"}</p>

        {user.tesserato && user.tesseraImg && (
          <div className="tessera">
            <Image src={user.tesseraImg} alt="Tessera" width={220} height={140} />
            <p className="note">La tua tessera digitale</p>
          </div>
        )}
      </div>

      <hr />

      <div className="profile-section">
        <h2>📌 Preferiti salvati</h2>
        {user.preferiti.length > 0 ? (
          <ul className="list">
            {user.preferiti.map((item, idx) => <li key={idx}>{item}</li>)}
          </ul>
        ) : (
          <p>Nessun preferito ancora.</p>
        )}
      </div>

      <div className="profile-section">
        <h2>📤 Bivacchi o Percorsi postati</h2>
        {user.postati?.length > 0 ? (
          <ul className="list">
            {user.postati.map((post, idx) => (
              <li key={idx}>
                <strong>{post.titolo}</strong> ({post.tipo}) - {new Date(post.data).toLocaleDateString()}
              </li>
            ))}
          </ul>
        ) : (
          <p>Non hai ancora condiviso nulla.</p>
        )}
      </div>

      <hr />

      <div className="profile-section">
        <h3>⚙️ Impostazioni account</h3>
        <p>(Funzionalità in sviluppo)</p>
        <button className="btnlog disabled">Modifica profilo</button>
      </div>
    </div>
  )
}
