"use client";

import { useState } from "react";
import "../../styles/loginregistrati.css";

interface Bivacco {
  _id: string;
  nome: string;
  localita: string;
  sentiero: string;
  altezza: number;
  capienza: number;
  descrizione: string;
  latitudine: number;
  longitudine: number;
}

interface Percorso {
  _id: string;
  nome: string;
  localita: string;
  sentiero: string;
  difficolta: string;
  pendenza_massima: string;
  lunghezza: string;
}

export default function HomePage() {
  const [view, setView] = useState<"bivacchi" | "percorsi" | null>(null);

  const [newBivacco, setNewBivacco] = useState<Bivacco>({
    _id: "",
    nome: "",
    localita: "",
    sentiero: "",
    altezza: 0,
    capienza: 0,
    descrizione: "",
    latitudine: 0,
    longitudine: 0,
  });

  const [newPercorso, setNewPercorso] = useState<Percorso>({
    _id: "",
    nome: "",
    localita: "",
    sentiero: "",
    difficolta: "",
    pendenza_massima: "",
    lunghezza: "",
  });

  const handleAddBivacco = () => {
    const { _id, ...bivaccoDataToSend } = newBivacco; // Rimuovi _id
    fetch("http://localhost:5000/api/bivacchi", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bivaccoDataToSend),
    })
      .then((res) => res.json())
      .then((data) => {
        alert("Bivacco aggiunto con successo!");
        setNewBivacco({
          _id: "",
          nome: "",
          localita: "",
          sentiero: "",
          altezza: 0,
          capienza: 0,
          descrizione: "",
          latitudine: 0,
          longitudine: 0,
        });
      })
      .catch((err) => {
        console.error("Errore nell'aggiunta del bivacco:", err);
        alert("Errore nell'aggiunta del bivacco");
      });
  };
  
  const handleAddPercorso = () => {
    const { _id, ...percorsoDataToSend } = newPercorso; // Rimuovi _id
    fetch("http://localhost:5000/api/percorsi", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(percorsoDataToSend),
    })
      .then((res) => res.json())
      .then((data) => {
        alert("Percorso aggiunto con successo!");
        setNewPercorso({
          _id: "",
          nome: "",
          localita: "",
          sentiero: "",
          difficolta: "",
          pendenza_massima: "",
          lunghezza: "",
        });
      })
      .catch((err) => {
        console.error("Errore nell'aggiunta del percorso:", err);
        alert("Errore nell'aggiunta del percorso");
      });
  };

  if (!view) {
    return (
      <div className="view-selector">
        <h1 className="welcome-title">Benvenuto!</h1>
        <p className="welcome-text">Scegli cosa vuoi aggiungere:</p>
        <button className="view-button" onClick={() => setView("bivacchi")}>
          Aggiungi Bivacco
        </button>
        <button className="view-button" onClick={() => setView("percorsi")}>
          Aggiungi Sentiero
        </button>
      </div>
    );
  }

  return (
    <div className={`active-view-${view}`}>
      <div className={`${view}-container`}>
        <h1 className={`${view}-title`}>Aggiungi un nuovo {view === "bivacchi" ? "Bivacco" : "Percorso"}</h1>

        <div className="add-form">
          {view === "bivacchi" ? (
            <div>
              <input
                type="text"
                placeholder="Nome"
                value={newBivacco.nome}
                onChange={(e) => setNewBivacco({ ...newBivacco, nome: e.target.value })}
              />
              <input
                type="text"
                placeholder="Località"
                value={newBivacco.localita}
                onChange={(e) => setNewBivacco({ ...newBivacco, localita: e.target.value })}
              />
              <input
                type="text"
                placeholder="Sentiero"
                value={newBivacco.sentiero}
                onChange={(e) => setNewBivacco({ ...newBivacco, sentiero: e.target.value })}
              />
              <input
                type="number"
                placeholder="Altezza"
                value={newBivacco.altezza}
                onChange={(e) => setNewBivacco({ ...newBivacco, altezza: Number(e.target.value) })}
              />
              <input
                type="number"
                placeholder="Capienza"
                value={newBivacco.capienza}
                onChange={(e) => setNewBivacco({ ...newBivacco, capienza: Number(e.target.value) })}
              />
              <input
                type="text"
                placeholder="Descrizione"
                value={newBivacco.descrizione}
                onChange={(e) => setNewBivacco({ ...newBivacco, descrizione: e.target.value })}
              />
              <input
                type="number"
                placeholder="Latitudine"
                value={newBivacco.latitudine}
                onChange={(e) => setNewBivacco({ ...newBivacco, latitudine: Number(e.target.value) })}
              />
              <input
                type="number"
                placeholder="Longitudine"
                value={newBivacco.longitudine}
                onChange={(e) => setNewBivacco({ ...newBivacco, longitudine: Number(e.target.value) })}
              />
              <button onClick={handleAddBivacco}>Aggiungi Bivacco</button>
            </div>
          ) : (
            <div>
              <input
                type="text"
                placeholder="Nome"
                value={newPercorso.nome}
                onChange={(e) => setNewPercorso({ ...newPercorso, nome: e.target.value })}
              />
              <input
                type="text"
                placeholder="Località"
                value={newPercorso.localita}
                onChange={(e) => setNewPercorso({ ...newPercorso, localita: e.target.value })}
              />
              <input
                type="text"
                placeholder="Sentiero"
                value={newPercorso.sentiero}
                onChange={(e) => setNewPercorso({ ...newPercorso, sentiero: e.target.value })}
              />
              <input
                type="text"
                placeholder="Difficoltà"
                value={newPercorso.difficolta}
                onChange={(e) => setNewPercorso({ ...newPercorso, difficolta: e.target.value })}
              />
              <input
                type="text"
                placeholder="Pendenza Massima"
                value={newPercorso.pendenza_massima}
                onChange={(e) => setNewPercorso({ ...newPercorso, pendenza_massima: e.target.value })}
              />
              <input
                type="text"
                placeholder="Lunghezza"
                value={newPercorso.lunghezza}
                onChange={(e) => setNewPercorso({ ...newPercorso, lunghezza: e.target.value })}
              />
              <button onClick={handleAddPercorso}>Aggiungi Percorso</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
