"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "../../context/AuthContext"

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

// Interfaccia per la singola recensione (per bivacchi e percorsi)
interface RecensioneItem {
  userEmail: string;
  voto: number;
}

interface Prenotazione {
  _id: string;
  mail: string;
  data: string;
  percorso: string;
  bivacco: string;
  numpartecipanti: number;
  fasciaOraria: string;
  bivaccoId?: string // Made optional
  percorsoId?: string // Made optional
}

// L'interfaccia Percorso nel frontend non ha bisogno del campo recensioni qui,
// perché la pagina Ricordi non mostra i dettagli completi del percorso,
// ma solo l'ID per recuperare il voto dell'utente.
// I voti specifici dell'utente vengono gestiti nello stato `percorsoVoti`.

export default function RicordiPage() {
  const { email, tesserato, isLoggedIn, loading } = useAuth()
  const [prenotazioni, setPrenotazioni] = useState<Prenotazione[]>([])
  const [escursioni, setEscursioni] = useState<Escursione[]>([])
  const [error, setError] = useState<string | null>(null)
  const [bivaccoVoti, setBivaccoVoti] = useState<{ [key: string]: number }>({})
  const [percorsoVoti, setPercorsoVoti] = useState<{ [key: string]: number }>({}) // Manteniamo questo stato per i percorsi

  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (!isLoggedIn) {
      router.push("/login")
      return
    }
    if (!tesserato) {
      router.push("/profilo")
      return
    }

    const fetchUserData = async () => {
      setError(null);

      try {
        const prenotazioniRes = await fetch("http://localhost:5000/api/ricordi/prenotazioni", {
          headers: {
            "Content-Type": "application/json",
            user_email: email,
          },
        })
        if (!prenotazioniRes.ok) {
          const errorText = await prenotazioniRes.text();
          throw new Error(`Failed to fetch prenotazioni: ${prenotazioniRes.status} ${errorText}`);
        }
        const fetchedPrenotazioni: Prenotazione[] = await prenotazioniRes.json()
        setPrenotazioni(fetchedPrenotazioni)

        // Filtra gli ID null/undefined prima di creare il set
        const bivaccoIds = Array.from(new Set(fetchedPrenotazioni.map(p => p.bivaccoId).filter(Boolean) as string[]));
        const percorsoIds = Array.from(new Set(fetchedPrenotazioni.map(p => p.percorsoId).filter(Boolean) as string[]));


        if (bivaccoIds.length > 0) {
          const bivaccoVotesRes = await fetch("http://localhost:5000/api/bivacchi/user-votes", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              user_email: email,
            },
            body: JSON.stringify({ bivaccoIds }),
          })

          if (!bivaccoVotesRes.ok) {
            const errorText = await bivaccoVotesRes.text();
            throw new Error(`Failed to fetch bivacco user votes: ${bivaccoVotesRes.status} ${errorText}`);
          }
          const fetchedBivaccoVotes = await bivaccoVotesRes.json()
          setBivaccoVoti(fetchedBivaccoVotes)
        }

        // Recupera i voti utente per i percorsi (ora utente-specifici)
        if (percorsoIds.length > 0) {
          const percorsoVotesRes = await fetch("http://localhost:5000/api/percorsi/user-votes", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              user_email: email, // Invia l'email per recuperare il voto specifico dell'utente
            },
            body: JSON.stringify({ percorsoIds }),
          })

          if (!percorsoVotesRes.ok) {
            const errorText = await percorsoVotesRes.text();
            throw new Error(`Failed to fetch percorso user votes: ${percorsoVotesRes.status} ${errorText}`);
          }
          const fetchedPercorsoVotes = await percorsoVotesRes.json()
          setPercorsoVoti(fetchedPercorsoVotes)
        }

      } catch (err: any) {
        setError(err.message || "Errore nel caricamento dei tuoi dati passati.");
        console.error("Error fetching user data:", err);
      }

      try {
        const escursioniRes = await fetch("http://localhost:5000/api/ricordi/escursioni", {
          headers: {
            "Content-Type": "application/json",
            user_email: email,
          },
        })
        if (!escursioniRes.ok) {
          const errorText = await escursioniRes.text();
          throw new Error(`Failed to fetch escursioni: ${escursioniRes.status} ${errorText}`);
        }
        const fetchedEscursioni = await escursioniRes.json()
        setEscursioni(fetchedEscursioni)
      } catch (err: any) {
        setError(prev => prev ? prev + " " + (err.message || "Errore nel caricamento delle tue escursioni.") : (err.message || "Errore nel caricamento delle tue escursioni."));
        console.error("Error fetching escursioni:", err);
      }
    }

    fetchUserData()

  }, [email, isLoggedIn, tesserato, loading, router])

  const inviaRecensione = async (id: string, voto: number, type: 'bivacco' | 'percorso') => {
    const currentVoti = type === 'bivacco' ? bivaccoVoti : percorsoVoti;
    const setTargetVoti = type === 'bivacco' ? setBivaccoVoti : setPercorsoVoti;
    const apiEndpoint = type === 'bivacco' ? "http://localhost:5000/api/bivacchi/vota" : "http://localhost:5000/api/percorsi/vota";
    const alertType = type === 'bivacco' ? "bivacco" : "percorso";
    const idKey = type === 'bivacco' ? "bivaccoId" : "percorsoId";

    if (currentVoti[id]) { // 'id' is guaranteed to be string here
      alert(`Hai già recensito questo ${alertType}.`);
      return;
    }

    try {
      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          user_email: email, // Invia l'email per tutte le recensioni utente-specifiche
        },
        body: JSON.stringify({ [idKey]: id, voto }),
      })

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Errore sconosciuto nell'invio della recensione del ${alertType}.`);
      }

      setTargetVoti(prev => ({ ...prev, [id]: voto }))
      alert(`Recensione ${alertType} inviata con successo!`)
    } catch (err: any) {
      alert(err.message || `Errore nell'invio della recensione del ${alertType}.`)
      console.error(`Error sending ${alertType} review:`, err)
    }
  }

  return (
    <div className="Ricordi-Container">
      <h1>Le tue prenotazioni passate</h1>
      {error && <p className="error-message">{error}</p>}

      {prenotazioni.length > 0 ? (
        <div>
          {prenotazioni.map(e => (
            <div key={e._id} className="escursione-card">
              <p><strong>Data:</strong> {e.data}</p>
              <p><strong>Percorso:</strong> {e.percorso}</p>
              <p><strong>Bivacco:</strong> {e.bivacco}</p>
              <p><strong>Partecipanti:</strong> {e.numpartecipanti}</p>
              <p><strong>Fascia oraria:</strong> {e.fasciaOraria}</p>

              {/* Recensisci Bivacco Section */}
              <div className="recensione-box">
                {e.bivaccoId ? ( // Check if bivaccoId exists
                  bivaccoVoti[e.bivaccoId] ? (
                    <p>
                      <strong>Hai già recensito il bivacco:</strong>
                      <span className="stars-display">
                        {[1, 2, 3, 4, 5].map((starValue) => (
                          <span
                            key={starValue}
                            className={`star-static ${(bivaccoVoti[e.bivaccoId!] ?? 0) >= starValue ? "active" : ""}`}
                          >★</span>
                        ))}
                      </span>
                      <span className="voted-message"> ({bivaccoVoti[e.bivaccoId!]} stelle)</span>
                    </p>
                  ) : (
                    <>
                      <p><strong>Lascia una recensione al bivacco:</strong></p>
                      <div className="stars">
                        {[1, 2, 3, 4, 5].map((starValue) => (
                          <span
                            key={starValue}
                            className={`star ${(bivaccoVoti[e.bivaccoId!] ?? 0) >= starValue ? "active" : ""}`}
                            onClick={() => inviaRecensione(e.bivaccoId!, starValue, 'bivacco')}
                            style={{ cursor: "pointer" }}
                          >★</span>
                        ))}
                      </div>
                    </>
                  )
                ) : (
                  <p className="info-message">Bivacco non memorizzato</p>
                )}
              </div>

              {/* Recensisci Percorso Section (ora uguale al bivacco) */}
              <div className="recensione-box">
                {e.percorsoId ? ( // Check if percorsoId exists
                  percorsoVoti[e.percorsoId] ? ( // Controlla se l'utente ha già votato
                    <p>
                      <strong>Hai già recensito il percorso:</strong>
                      <span className="stars-display">
                        {[1, 2, 3, 4, 5].map((starValue) => (
                          <span
                            key={starValue}
                            className={`star-static ${(percorsoVoti[e.percorsoId!] ?? 0) >= starValue ? "active" : ""}`}
                          >★</span>
                        ))}
                      </span>
                      <span className="voted-message"> ({percorsoVoti[e.percorsoId!]} stelle)</span>
                    </p>
                  ) : (
                    <>
                      <p><strong>Lascia una recensione al percorso:</strong></p>
                      <div className="stars">
                        {[1, 2, 3, 4, 5].map((starValue) => (
                          <span
                            key={starValue}
                            className={`star ${(percorsoVoti[e.percorsoId!] ?? 0) >= starValue ? "active" : ""}`}
                            onClick={() => inviaRecensione(e.percorsoId!, starValue, 'percorso')}
                            style={{ cursor: "pointer" }}
                          >★</span>
                        ))}
                      </div>
                    </>
                  )
                ) : (
                  <p className="info-message">Percorso non memorizzato</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>Non ci sono prenotazioni passate.</p>
      )}

      <hr className="section-divider" />

      <h1>Le escursioni pubbliche a cui hai partecipato</h1>
      {escursioni.length > 0 ? (
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
      ) : (
        <p>Non ci sono escursioni pubbliche passate.</p>
      )}

      <Link href="/profilo">
        <button>TORNA AL PROFILO</button>
      </Link>
    </div>
  )
}