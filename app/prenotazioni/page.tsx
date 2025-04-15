"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import "../../styles/bivacchi.css";

interface Prenotazione {
  _id: string;
  mail: string;
  data: string;
  percorso: string;
  bivacco: string;
}

interface Percorso {
  _id: string;
  nome: string;
}

interface Bivacco {
  _id: string;
  nome: string;
}

const Prenotazioni = () => {
  const { isLoggedIn, email } = useAuth();
  const router = useRouter();
  const [prenotazioni, setPrenotazioni] = useState<Prenotazione[]>([]);
  const [percorsi, setPercorsi] = useState<Percorso[]>([]);
  const [bivacchi, setBivacchi] = useState<Bivacco[]>([]);
  const [error, setError] = useState<string>("");
  const [deleteMode, setDeleteMode] = useState<string | null>(null);
  const [updateMode, setUpdateMode] = useState<string | null>(null);
  const [editData, setEditData] = useState<string>("");
  const [editPercorso, setEditPercorso] = useState<string>("");
  const [editBivacco, setEditBivacco] = useState<string>("");

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/");
      return;
    }

    // Carica le prenotazioni
    fetch("http://localhost:5000/api/prenotazioni", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "user_email": email,
      },
    })
      .then((res) => res.json())
      .then((data) => setPrenotazioni(data))
      .catch((err) => console.error("Errore nel caricamento", err));

    fetch("http://localhost:5000/api/percorsi")
      .then((res) => res.json())
      .then((data) => setPercorsi(data));

    fetch("http://localhost:5000/api/bivacchi")
      .then((res) => res.json())
      .then((data) => setBivacchi(data));
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

  const startEdit = (p: Prenotazione) => {
    setError("");
    setUpdateMode(p._id);
    setDeleteMode(null);
    setEditData(p.data);
    setEditPercorso(p.percorso);
    setEditBivacco(p.bivacco);
  };

  const saveEdit = async (id: string) => {
    setError("");
    try {
      const response = await fetch("http://localhost:5000/api/prenotazioni/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_prenotazione: id,
          nuova_data: editData,
          nuovo_percorso: editPercorso,
          nuovo_bivacco: editBivacco,
        }),
      });

      if (response.ok) {
        // aggiorna lo stato locale
        setPrenotazioni(prev =>
          prev.map(p =>
            p._id === id
              ? { ...p, data: editData, percorso: editPercorso, bivacco: editBivacco }
              : p
          )
        );
        setUpdateMode(null);
      } else {
        const data = await response.json();
        setError(data.message);
      }
    } catch (error) {
      setError("Errore durante la modifica");
    }
  };

  return (
    <div className="prenotazioni-container">
      <h1 className="prenotazioni-title">LE TUE ESCURSIONI PROGRAMMATE</h1>

      {prenotazioni.length === 0 ? (
        <p className="no-results">Non hai escursioni programmate!</p>
      ) : (
        <div className="prenotazioni-grid">
          {prenotazioni.map((p) => (
            <div key={p._id} className="prenotazioni-card">
              {updateMode === p._id ? (
                <div className="update-mode">
                  <label>Data:</label>
                  <input
                    type="date"
                    value={editData}
                    onChange={(e) => setEditData(e.target.value)}
                  />

                  <label>Percorso:</label>
                  <select
                    value={editPercorso}
                    onChange={(e) => setEditPercorso(e.target.value)}
                  >
                    {percorsi.map(percorso => (
                      <option key={percorso._id} value={percorso.nome}>{percorso.nome}</option>
                    ))}
                  </select>

                  <label>Bivacco:</label>
                  <select
                    value={editBivacco}
                    onChange={(e) => setEditBivacco(e.target.value)}
                  >
                    {bivacchi.map(bivacco => (
                      <option key={bivacco._id} value={bivacco.nome}>{bivacco.nome}</option>
                    ))}
                  </select>

                  <button onClick={() => saveEdit(p._id)}>Invia</button>
                  <button onClick={() => setUpdateMode(null)} className="red-btn">Annulla</button>
                </div>
              ) : (
                <>
                  <p><strong>Data:</strong> {p.data}</p>
                  <p><strong>Percorso:</strong> {p.percorso}</p>
                  <p><strong>Bivacco:</strong> {p.bivacco}</p>
                  <div className="delete-mode">
                    {deleteMode === p._id ? (
                      <>
                        <h2>Sei sicuro di eliminarla?</h2>
                        <button onClick={() => confirmDelete(p._id)} className="red-btn">Si</button>
                        <button onClick={() => setDeleteMode(null)}>No</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setDeleteMode(p._id); setUpdateMode(null); }}
                          className="red-btn">Elimina</button>
                        <button onClick={() => startEdit(p)}>Modifica</button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
      <footer>
        <h2>Vuoi programmare un'escursione? <Link href="/esplora">CLICCA QUI</Link></h2>
      </footer>
    </div>
  );
};

export default Prenotazioni;