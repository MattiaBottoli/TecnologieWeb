"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth} from "../../context/AuthContext"

interface Escursione {
  _id: string;
  giorno: string;
  ora: string;
  percorso: string;
  guida: string;
  partecipanti: string[];
  maxPartecipanti: number;
  descrizione?: string;
}

interface Prenotazione {
  _id: string;
  mail: string;
  data: string;
  percorso: string;
  bivacco: string;
  numpartecipanti: number;
  fasciaOraria: string;
  bivaccoId: string
  percorsoId: string
}

export default function RicordiPage() {
  const { email, tesserato, isLoggedIn, loading }= useAuth()
  const [prenotazioni, setPrenotazioni] = useState<Prenotazione[]>([])
  const [escursioni, setEscursioni] = useState<Escursione[]>([])
  const [error, setError] = useState<string | null>(null);
  const router = useRouter()

  useEffect(() => {
    if(loading) return
    if (!isLoggedIn) {
      router.push("/login")
      return
    }
    if(!tesserato){
      router.push("/profilo")
      return
    }
    fetch("http://localhost:5000/api/ricordi/prenotazioni", {
      headers: {
        "Content-Type": "application/json",
        user_email: email,
      },
    })
      .then(res => res.json())
      .then(setPrenotazioni)
      .catch(() => {
        setError("Errore nel caricamento delle tue prenotazioni.");
      });

    fetch("http://localhost:5000/api/ricordi/escursioni", {
      headers: {
        "Content-Type": "application/json",
        user_email: email,
      },
    })
      .then(res => res.json())
      .then(setEscursioni)
      .catch(() => {
        setError("Errore nel caricamento delle tue escursioni.");
      });
  }, [email, isLoggedIn, tesserato, loading])

  return (
    <div className="Ricordi-Container">
      <h1>Le tue escursioni passate</h1>
      {prenotazioni.length > 0 ? (
        <div>
          {prenotazioni.map(e => (
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
      <hr className="section-divider" />
      <h1>Le escursioni pubbliche a cui hai partecipato</h1>
      {escursioni.length > 0 ? (
        <>
          <ul className="lista-escursioni">
          {escursioni.map(e => (
            <li key={e._id} className="escursione-card">
              <h3>{e.percorso}</h3>
              <p><strong>Giorno:</strong> {e.giorno}</p>
              <p><strong>Ora:</strong> {e.ora}</p>
              <p><strong>Guida:</strong> {e.guida}</p>
              <p><strong>Partecipanti:</strong> {e.partecipanti.length}/{e.maxPartecipanti}</p>
              {e.descrizione && <p><strong>Descrizione:</strong> {e.descrizione}</p>}
            </li>
          ))}
          </ul>
        </>
      ) : (
        <p>Non ci sono escursioni passate.</p>
      )}
      <Link href="/profilo">
        <button>TORNA AL PROFILO</button>
      </Link>
    </div>
  )
}