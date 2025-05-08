"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import "../../styles/escursioni.css";

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
}

export default function EscursioniUnificate() {
  const { isLoggedIn, email } = useAuth();
  const router = useRouter();

  const [escursioni, setEscursioni] = useState<Escursione[]>([]);
  const [prenotazioni, setPrenotazioni] = useState<Prenotazione[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteMode, setDeleteMode] = useState<string | null>(null);

  useEffect(() => {
    // Recupera escursioni pubbliche
    const fetchEscursioni = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/escursioni");
        const data = await response.json();
        setEscursioni(data);
      } catch (err) {
        setError("Errore nel recupero delle escursioni.");
      } finally {
        setLoading(false);
      }
    };

    fetchEscursioni();
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;

    // Recupera escursioni personali
    fetch("http://localhost:5000/api/prenotazioni", {
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
  }, [isLoggedIn, email]);

  const handleIscrizione = async (idEscursione: string) => {
    if (!email) {
      alert("Devi effettuare il login per iscriverti!");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/escursioni/${idEscursione}/iscrivi`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ utenteEmail: email }),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Errore durante l'iscrizione.");

      setEscursioni(prev => prev.map(e => (e._id === idEscursione ? result : e)));
      alert("Iscrizione avvenuta con successo!");
    } catch (e: any) {
      alert(e.message);
    }
  };

  const confirmDelete = async (id: string) => {
    try {
      const response = await fetch("http://localhost:5000/api/prenotazioni/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", id_prenotazione: id },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      }

      setPrenotazioni(prev => prev.filter(p => p._id !== id));
      setDeleteMode(null);
    } catch (e: any) {
      setError(e.message || "Errore durante l'eliminazione.");
    }
  };

  const handleModifica = (idPrenotazione: string) => {
    router.push(`/escursioni/modifica?idPrenotazione=${idPrenotazione}`);
  };

  return (
    <div className="pagina-escursioni-unificate">
      <h1>Escursioni Disponibili</h1>
      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-container">
          <p>Caricamento in corso...</p>
          <div className="spinner"></div>
        </div>
      ) : escursioni.length === 0 ? (
        <p>Nessuna escursione disponibile al momento.</p>
      ) : (
        <ul className="lista-escursioni">
          {escursioni.map(e => (
            <li key={e._id} className="escursione-card">
              <h3>{e.percorso}</h3>
              <p><strong>Giorno:</strong> {e.giorno}</p>
              <p><strong>Ora:</strong> {e.ora}</p>
              <p><strong>Guida:</strong> {e.guida}</p>
              <p><strong>Partecipanti:</strong> {e.partecipanti.length}/{e.maxPartecipanti}</p>
              {e.descrizione && <p><strong>Descrizione:</strong> {e.descrizione}</p>}

              {isLoggedIn ? (
                e.partecipanti.includes(email) ? (
                  <span className="iscritto-label">Già iscritto</span>
                ) : e.partecipanti.length >= e.maxPartecipanti ? (
                  <span className="completo-label">Completo</span>
                ) : (
                  <button onClick={() => handleIscrizione(e._id)} className="iscriviti-button">
                    Iscriviti
                  </button>
                )
              ) : (
                <button disabled className="iscriviti-button disabled">Iscriviti</button>
              )}
            </li>
          ))}
        </ul>
      )}

      <hr className="section-divider" />
      <h1 className="prenotazioni-title">Le tue Escursioni Programmate</h1>

      {prenotazioni.length === 0 ? (
        <p className="no-results">Non hai escursioni programmate.</p>
      ) : (
        <div className="prenotazioni-grid">
          {prenotazioni.map(p => (
            <div key={p._id} className="prenotazioni-card">
              <p><strong>Data:</strong> {p.data}</p>
              <p><strong>Percorso:</strong> {p.percorso}</p>
              <p><strong>Bivacco:</strong> {p.bivacco}</p>
              <p><strong>Partecipanti:</strong> {p.numpartecipanti}</p>
              <p><strong>Fascia oraria:</strong> {p.fasciaOraria}</p>
              <div className="delete-mode">
                {deleteMode === p._id ? (
                  <>
                    <h2>Sei sicuro?</h2>
                    <button onClick={() => confirmDelete(p._id)} className="red-btn">Sì</button>
                    <button onClick={() => setDeleteMode(null)}>No</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setDeleteMode(p._id)} className="red-btn">Elimina</button>
                    <button onClick={() => handleModifica(p._id)}>Modifica</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <footer>
        <h2>
          Vuoi programmare un'escursione?{" "}
          <Link href="/esplora/programmazione">CLICCA QUI</Link>
        </h2>
      </footer>
    </div>
  );
}