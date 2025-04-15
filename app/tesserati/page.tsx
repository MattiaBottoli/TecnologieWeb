"use client"

import { useEffect, useState } from "react"
import { useAuth } from "../../context/AuthContext"
import "../../styles/tesseramento.css"

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
      const updatedUser = { ...user, tesserato: true, tesseraImg: "/vipcard.png" }
      setUser(updatedUser)
      login(updatedUser.mail, true)
      alert("Pagamento completato! Ora hai accesso ai contenuti premium.")
    } catch (err) {
      alert(`Errore: ${(err as Error).message}`)
      console.error(err)
    }
  }

  if (isLoading) return <p>Caricamento...</p>
  if (!user) return <p>Utente non trovato.</p>

  return (
    <div style={{ maxWidth: "768px", margin: "0 auto", padding: "2rem" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}>Tesseramento</h1>
      {user.tesserato ? (
        <>
          <p style={{ color: "green", fontWeight: 600 }}>
            Sei tesserato! 🎉 Grazie {user.username || user.mail}!
          </p>
          <div style={{ marginTop: "1rem" }}>
            <h2 style={{ fontWeight: 500 }}>Preferiti:</h2>
            {user.preferiti.length > 0 ? (
              <ul style={{ paddingLeft: "1.5rem", color: "#666" }}>
                {user.preferiti.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize: "0.875rem", color: "#666" }}>Nessun preferito salvato.</p>
            )}
          </div>
        </>
      ) : (
        <>
          <p style={{ color: "#d97706", fontWeight: 600 }}>
            Non sei ancora tesserato. Fallo subito in poco tempo
          </p>

          <div style={{ marginTop: "1rem" }}>
            <h2 style={{ fontWeight: 500 }}>Ti potrebbero piacere:</h2>
            <ul style={{ paddingLeft: "1.5rem", color: "#666" }}>
              <li>Bivacco Gervasutti</li>
              <li>Percorso Rocciamelone</li>
              <li>Bivacco Rainetto</li>
            </ul>
          </div>
          <hr style={{ margin: "2rem 0" }} />
          <div style={{ textAlign: "center" }}>
            <p>Vuoi accedere ai preferiti e ad altri vantaggi?</p>
            <button
              onClick={handlePayment}
              style={{
                marginTop: "0.5rem",
                padding: "0.5rem 1rem",
                backgroundColor: "#2563eb",
                color: "white",
                borderRadius: "0.375rem",
                border: "none",
              }}
            >
              Tesserati ora
            </button>
          </div>
        </>
      )}
    </div>
  )
}
