"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import "../../styles/bivacchi.css"

interface Prenotazione {
  _id: string;
  mail: string;
  data: string;
  percorso: string;
  bivacco: string;
  numpartecipanti: number;
  fasciaOraria: string;
}

const Prenotazioni = () => {
  const { isLoggedIn, email } = useAuth();
  const router = useRouter();
  const [prenotazioni, setPrenotazioni] = useState<Prenotazione[]>([]);
  const [error, setError] = useState<string>("");
  const [deleteMode, setDeleteMode] = useState<string | null>(null);

useEffect(() => {
  if (!isLoggedIn) {
    router.push("/");
    return;
  }

  // 1. Carica le prenotazioni dell’utente per visualizzazione
  fetch("http://localhost:5000/api/prenotazioni", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "user_email": email,
    },
  })
    .then((res) => res.json())
    .then((data) => setPrenotazioni(data))
    .catch((err) => {
      console.error("Errore nel caricamento utente", err);
      setError("Errore nel caricamento delle prenotazioni.");
    });

  // 2. Carica tutte le prenotazioni per controllo incongruenze
  fetch("http://localhost:5000/api/prenotazioni")
    .then((res) => res.json())
    .then((allData: Prenotazione[]) => {
      const duplicates: { [key: string]: Prenotazione[] } = {};

      allData.forEach((p) => {
        const key = `${p.data}_${p.bivacco}_${p.fasciaOraria}`;
        if (!duplicates[key]) {
          duplicates[key] = [];
        }
        duplicates[key].push(p);
      });

      const overlapping = Object.values(duplicates).filter(group => group.length > 1);
      if (overlapping.length > 0) {
        const conflictMessages = overlapping.map(group => {
          const ids = group.map(p => `ID: ${p._id}, Email: ${p.mail}`).join(" | ");
          return `⚠️ Conflitto su ${group[0].bivacco} il ${group[0].data} (${group[0].fasciaOraria}): ${ids}`;
        }).join("\n");

        console.warn("CONFLITTI RILEVATI:\n" + conflictMessages);
        setError("⚠️ Conflitti rilevati con altre prenotazioni. Vedi console.");
      }
    })
    .catch((err) => {
      console.error("Errore nel controllo incongruenze", err);
    });
}, [isLoggedIn, email, router]);


  const confirmDelete = async (id: string) => {
    setError("");
    try {
      const response = await fetch("http://localhost:5000/api/prenotazioni/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "id_prenotazione": id,
        },
      });

      if (response.ok) {
        setPrenotazioni(prev => prev.filter(p => p._id !== id));
        setDeleteMode(null);
      } else {
        const data = await response.json();
        setError(data.message);
      }
    } catch (error) {
      setError("Errore nella connessione al server");
    }
  };

  const handleModifica = (idPrenotazione: string) => {
    router.push(`/esplora/programmazione?idPrenotazione=${idPrenotazione}`);
  };

  return (
    <div className="prenotazioni-container">
      <h1 className="prenotazioni-title">LE TUE ESCURSIONI PROGRAMMATE</h1>
      {error && <div className="error-message">{error}</div>}

      {prenotazioni.length === 0 ? (
        <p className="no-results">Non hai escursioni programmate!</p>
      ) : (
        <div className="prenotazioni-grid">
          {prenotazioni.map((p) => (
            <div key={p._id} className="prenotazioni-card">
              <p><strong>Data:</strong> {p.data}</p>
              <p><strong>Numero Partecipanti:</strong> {p.numpartecipanti}</p>
              <p><strong>Percorso:</strong> {p.percorso}</p>
              <p><strong>Bivacco:</strong> {p.bivacco}</p>
              <p><strong>Fascia Oraria:</strong> {p.fasciaOraria}</p>
              <div className="delete-mode">
                {deleteMode === p._id ? (
                  <>
                    <h2>Sei sicuro di eliminarla?</h2>
                    <button onClick={() => confirmDelete(p._id)} className="red-btn">SÃ¬</button>
                    <button onClick={() => setDeleteMode(null)}>No</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { setDeleteMode(p._id); }} className="red-btn">Elimina</button>
                    <button onClick={() => handleModifica(p._id)}>Modifica</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <footer>
        <h2>Vuoi programmare un'escursione? <Link href="/esplora/programmazione">CLICCA QUI</Link></h2>
      </footer>
    </div>
  );
};

export default Prenotazioni;