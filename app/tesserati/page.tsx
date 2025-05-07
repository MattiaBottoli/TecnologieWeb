"use client"

import { useEffect, useState } from "react"
import { useAuth } from "../../context/AuthContext"
import "../../styles/tesseramento.css"
import Link from "next/link"

interface User {
  username?: string
  mail: string
  tesserato: boolean
  tesseraImg?: string
  preferiti: string[]
  prenotatiDaAltri: string[]
}

export default function TesseramentoPage() {
  const { email, login, tesserato: authTesserato } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!email) return
        const res = await fetch(`http://localhost:5000/api/utente/${email}`)
        if (!res.ok) throw new Error("Errore nella fetch dell'utente")

        const data = await res.json()
        if (!data.user) throw new Error("Risposta malformata dal server")

        setUser(data.user)
        login(data.user.mail, data.user.tesserato)
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUser()
  }, [email, login])

  const handlePayment = async () => {
    if (!user || user.tesserato) return
    try {
      const res = await fetch(`http://localhost:5000/api/tesseramento`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mail: user.mail }),
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Errore nel pagamento")
      }

      const updatedUser = {
        ...user,
        tesserato: true,
        tesseraImg: "/vipcard.png",
      }

      setUser(updatedUser)
      login(updatedUser.mail, true)
      alert("Pagamento completato! Ora hai accesso ai contenuti premium.")
    } catch (err) {
      alert(`Errore: ${(err as Error).message}`)
      console.error(err)
    }
  }

  if (isLoading) return <p className="loading-text">Caricamento...</p>

  if (!user) {
    return (
      <div className="container">
        <h1>Accesso richiesto</h1>
        <p>Per accedere a questa pagina, devi essere registrato.</p>
        <div className="btn-group">
          <Link href="/registrati">
            <button className="btnlog">Registrati</button>
          </Link>
          <Link href="/login">
            <button className="btnlog">Login</button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <h1>Tesseramento</h1>

      {user.tesserato ? (
        <>
          <p className="success-text">
            Sei tesserato! 🎉 Grazie, <strong>{user.username || user.mail}</strong>!
          </p>

          <h4>I tuoi preferiti:</h4>
          {user.preferiti.length > 0 ? (
            <ul className="favorites-list">
              {user.preferiti.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="empty-info">Non hai ancora salvato preferiti.</p>
          )}
        </>
      ) : (
        <>
          <p className="warning-text">
            Non sei ancora tesserato. Fallo subito e ottieni i vantaggi!
          </p>

          <h4>Ti potrebbero piacere:</h4>
          <ul className="favorites-list">
            <li>Bivacco Gervasutti</li>
            <li>Percorso Rocciamelone</li>
            <li>Bivacco Rainetto</li>
          </ul>

          <hr className="divider" />

          <div className="centered">
            <p>Vuoi accedere ai preferiti e ai contenuti premium?</p>
            <button onClick={handlePayment} className="btnlog">
              Tesserati ora
            </button>
          </div>
        </>
      )}
    </div>
  )
}
