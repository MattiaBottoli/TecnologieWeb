"use client"

import { useEffect, useState } from "react"
import { useAuth } from "../../context/AuthContext"
import "../../styles/tesseramento.css"
import Link from "next/link"
import Image from "next/image"

interface User {
  username?: string
  mail: string
  tesserato: boolean
  tesseraImg?: string
  preferiti: string[]
  prenotatiDaAltri: string[]
}

interface Post {
  id: string
  autore: string
  descrizione: string
  fotoUrl?: string
  tipo: "bivacco" | "percorso" | "foto"
  data: string
}

export default function ClubAlpinoPage() {
  const { email, login, tesserato: authTesserato } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [posts, setPosts] = useState<Post[]>([])
  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!email) return
        const res = await fetch(`http://localhost:5000/api/utente/${email}`)
        if (!res.ok) throw new Error("Errore nella fetch dell'utente")
        const data = await res.json()
        setUser(data.user)
        login(data.user.mail, data.user.tesserato)
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    const fetchPosts = async () => {
      try {
        // Per ora mockati
        setPosts([
          {
            id: "1",
            autore: "mario_hiker",
            descrizione: "Salita notturna al Rocciamelone 🏔️✨",
            fotoUrl: "/rocciamelone.jpg",
            tipo: "foto",
            data: "2025-05-01",
          },
          {
            id: "2",
            autore: "giulia.trek",
            descrizione: "Nuovo bivacco scoperto: Bivacco Rainetto 🛖",
            tipo: "bivacco",
            data: "2025-05-03",
          },
        ])
      } catch (err) {
        console.error(err)
      }
    }

    fetchUser()
    fetchPosts()
  }, [email, login])

  const handlePayment = async () => {
    if (!user || user.tesserato) return
    try {
      const res = await fetch(`http://localhost:5000/api/tesseramento`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mail: user.mail }),
      })
      if (!res.ok) throw new Error("Errore nel tesseramento")
      const updatedUser = { ...user, tesserato: true, tesseraImg: "/vipcard.png" }
      setUser(updatedUser)
      login(updatedUser.mail, true)
      alert("Ora sei tesserato! 🎉")
    } catch (err) {
      alert("Errore nel pagamento")
      console.error(err)
    }
  }

  if (isLoading) return <p>Caricamento dati...</p>

  if (!user) {
    return (
      <div className="container">
        <h1>Accedi al Club Alpino</h1>
        <p>Devi essere registrato per entrare nella community.</p>
        <Link href="/registrati"><button className="btnlog">Registrati</button></Link>
        <Link href="/login"><button className="btnlog">Login</button></Link>
      </div>
    )
  }

  return (
    <div className="container">
      <h1>🏔️ Club Alpino</h1>

      {user.tesserato ? (
        <>
          <p className="success-text">Ciao <strong>{user.username || user.mail}</strong>, sei tesserato!</p>
          <Image src="/vipcard.png" alt="Tessera" width={200} height={120} />

          <section className="post-form">
            <h2>Condividi la tua esperienza</h2>
            <p>Presto qui ci sarà un form per caricare le tue escursioni e foto!</p>
          </section>
        </>
      ) : (
        <section className="tesseramento-box">
          <p className="warning-text">Diventa tesserato per accedere al feed completo e postare!</p>
          <button onClick={handlePayment} className="btnlog">Tesserati ora</button>
        </section>
      )}

      <section className="social-feed">
        <h2>📸 Feed della community</h2>
        {posts.map(post => (
          <div key={post.id} className="post-card">
            <p><strong>@{post.autore}</strong> - {new Date(post.data).toLocaleDateString()}</p>
            <p>{post.descrizione}</p>
            {post.fotoUrl && (
              <Image src={post.fotoUrl} alt="Foto postata" width={400} height={250} />
            )}
            <span className="badge">{post.tipo.toUpperCase()}</span>
          </div>
        ))}
      </section>
    </div>
  )
}
