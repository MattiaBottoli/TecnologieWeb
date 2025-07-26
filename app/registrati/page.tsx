"use client"

import { useState } from "react"
import { useRouter } from "next/navigation";

interface UserData {
  nome: string
  cognome: string
  username: string
  mail: string
  password: string
  tesserato: boolean
  preferiti: string[]
}

export default function Registrati() {
  const [nome, setNome] = useState("")
  const [cognome, setCognome] = useState("")
  const [username, setUsername] = useState("")
  const [mail, setMail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const isPasswordValid = (pwd: string): boolean => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,15}$/
    return regex.test(pwd)
  }

  const isEmailValid = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!isEmailValid(mail)) {
    setError("Inserisci un indirizzo email valido.");
    return;
    }

    if (!isPasswordValid(password)) {
      setError("La password deve essere lunga 8-15 caratteri e contenere almeno una lettera maiuscola, una minuscola, un numero e un carattere speciale.");
      return;
    }

    const userData: UserData = {
      nome,
      cognome,
      username,
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
        router.push("/login")
      } else {
        setError(data.message)
      }
    } catch (err) {
      console.error("Errore registrazione:", err)
      setError("Errore durante la registrazione. Riprova.")
    }
  }

  return (
    <div className="Registrati-Container">
      <form onSubmit={handleSubmit}>
        <fieldset>
          <header>
            <h1>REGISTRATI</h1>
            <h4>Inserisci i dati richiesti:</h4>
          </header>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <section>
            <label>NOME</label>
            <input placeholder="Inserisci il tuo Nome..." type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
          </section>
          <section>
            <label>COGNOME</label>
            <input placeholder="Inserisci il tuo Cognome..." type="text" value={cognome} onChange={(e) => setCognome(e.target.value)} required />
          </section>
          <section>
            <label>USERNAME</label>
            <input placeholder="Inserisci il tuo Username..." type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </section>
          <section>
            <label>E-MAIL</label>
            <input placeholder="Inserisci la tua Email..." type="email" value={mail} onChange={(e) => setMail(e.target.value)} required />
          </section>
          <section>
            <label>PASSWORD</label>
            <input
              placeholder="Inserisci la Password..."
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </section>
          <section>
            <button type="submit" className="btnlog">CREA</button>
          </section>
          <footer>
            <p><strong>Hai già un account? </strong><a href="/login">ACCEDI</a></p>
          </footer>
        </fieldset>
      </form>
    </div>
  )
}
