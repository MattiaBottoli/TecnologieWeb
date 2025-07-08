"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth} from "../../context/AuthContext"

interface Prenotazione {
  _id: string;
  mail: string;
  data: string;
  percorso: string;
  bivacco: string;
  numpartecipanti: number;
  fasciaOraria: string;
}

export default function RicordiPage() {
  const { email, isTesserato, isLoggedIn }= useAuth()
  const [escursioni, setEscursioni] = useState<Prenotazione[]>([])
  const [error, setError] = useState<string | null>(null);
  const router = useRouter()

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login")
      return
    }
    if(!isTesserato){
      router.push("/profilo")
      return
    }
    fetch("http://localhost:5000/api/ricordi", {
      headers: {
        "Content-Type": "application/json",
        user_email: email,
      },
    })
      .then(res => res.json())
      .then(setEscursioni)
      .catch(() => {
        setError("Errore nel caricamento delle tue prenotazioni.");
      });
  }, [email, isLoggedIn, isTesserato])

  return (
    <div className="Ricordi-Container">
      <h1>Le tue escursioni passate</h1>
      {escursioni.length > 0 ? (
        <div>
          {escursioni.map(e => (
            <div key={e._id}>
              <p><strong>Data:</strong> {e.data}</p>
              <p><strong>Percorso:</strong> {e.percorso}</p>
              <p><strong>Bivacco:</strong> {e.bivacco}</p>
              <p><strong>Partecipanti:</strong> {e.numpartecipanti}</p>
              <p><strong>Fascia oraria:</strong> {e.fasciaOraria}</p>
              {/* Qui aggiungeremo il voto */}
            </div>
          ))}
        </div>
      ) : (
        <p>Non ci sono escursioni passate.</p>
      )}
      <Link href="/profilo">
        <button>TORNA AL PROFILO</button>
      </Link>
    </div>
  )
}