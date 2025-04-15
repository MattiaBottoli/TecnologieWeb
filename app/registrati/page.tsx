// app/registrati/page.tsx
"use client"

import { useState } from "react"
import "../../styles/loginregistrati.css"

interface UserData {
  nome: string
  cognome: string
  mail: string
  password: string
  tesserato: boolean
  preferiti: string[]
}

export default function Registrati() {
  const [nome, setNome] = useState("")
  const [cognome, setCognome] = useState("")
  const [mail, setMail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const userData: UserData = {
      nome,
      cognome,
      mail,
      password,
      tesserato: false,
      preferiti: [],
    }

    try {
      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })

      const data = await res.json()
      if (res.ok) {
        alert("Registrazione completata!")
        setNome("")
        setCognome("")
        setMail("")
        setPassword("")
      } else {
        setError(data.message)
      }
    } catch (err) {
      console.error("Errore registrazione:", err)
    }
  }

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <fieldset>
          <header>
            <h1>REGISTRATI</h1>
            <h4>Inserisci i dati richiesti:</h4>
          </header>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <section>
            <label>NOME</label>
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
          </section>
          <section>
            <label>COGNOME</label>
            <input type="text" value={cognome} onChange={(e) => setCognome(e.target.value)} required />
          </section>
          <section>
            <label>E-MAIL</label>
            <input type="email" value={mail} onChange={(e) => setMail(e.target.value)} required />
          </section>
          <section>
            <label>PASSWORD</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </section>
          <section>
            <button type="submit">CREA</button>
          </section>
          <footer>
            <p><strong>Hai già un account? </strong><a href="/login">ACCEDI</a></p>
          </footer>
        </fieldset>
      </form>
    </div>
  )
}
