"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import "../../styles/bivacchi.css";

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
  const [searchTerm, setSearchTerm] = useState("");

  const [bivacchi, setBivacchi] = useState<Bivacco[]>([]);
  const [likedBivacchi, setLikedBivacchi] = useState<{ [id: string]: boolean }>({});

  const [percorsi, setPercorsi] = useState<Percorso[]>([]);
  const [likedPercorsi, setLikedPercorsi] = useState<{ [id: string]: boolean }>({});

  useEffect(() => {
    if (view === "bivacchi") {
      fetch("http://localhost:5000/api/bivacchi")
        .then((res) => res.json())
        .then((data) => {
          console.log("Dati bivacchi caricati:", data); // Log dei dati caricati
          setBivacchi(data);
          const stored = localStorage.getItem("likedBivacchi");
          if (stored) setLikedBivacchi(JSON.parse(stored));
        })
        .catch((err) => {
          console.error("Errore nel caricamento dei bivacchi:", err); // Log dell'errore
          alert("Errore nel caricamento dei bivacchi");
        });
    }

    if (view === "percorsi") {
      fetch("http://localhost:5000/api/percorsi")
        .then((res) => res.json())
        .then((data) => {
          console.log("Dati percorsi caricati:", data); // Log dei dati caricati
          setPercorsi(data);
          const stored = localStorage.getItem("likedPercorsi");
          if (stored) setLikedPercorsi(JSON.parse(stored));
        })
        .catch((err) => {
          console.error("Errore nel caricamento dei percorsi:", err); // Log dell'errore
          alert("Errore nel caricamento dei percorsi");
        });
    }
  }, [view]);

  const toggleLikeBivacco = (id: string) => {
    const updated = { ...likedBivacchi, [id]: !likedBivacchi[id] };
    setLikedBivacchi(updated);
    localStorage.setItem("likedBivacchi", JSON.stringify(updated));
  };

  const toggleLikePercorso = (id: string) => {
    const updated = { ...likedPercorsi, [id]: !likedPercorsi[id] };
    setLikedPercorsi(updated);
    localStorage.setItem("likedPercorsi", JSON.stringify(updated));
  };

  const filteredBivacchi = bivacchi.filter((b) =>
    b.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPercorsi = percorsi.filter((p) =>
    p.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!view) {
    return (
      <div className="view-selector">
        <h1 className="welcome-title">Benvenuto!</h1>
        <p className="welcome-text">Scegli cosa vuoi cercare:</p>
        <button className="view-button" onClick={() => setView("bivacchi")}>
          Cerca Bivacco
        </button>
        <button className="view-button" onClick={() => setView("percorsi")}>
          Cerca Sentiero
        </button>
      </div>
    );
  }

  return (
    <div className={`active-view-${view}`}>
      <div className={`${view}-container`}>
        <h1 className={`${view}-title`}>Elenco dei {view === "bivacchi" ? "Bivacchi" : "Percorsi"}</h1>

        <div className="search-container">
          <input
            type="text"
            placeholder={`Cerca un ${view === "bivacchi" ? "bivacco" : "percorso"}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className={`${view}-grid`}>
          {view === "bivacchi"
            ? filteredBivacchi.map((b) => (
                <div key={b._id} className="bivacco-card">
                  <div className="bivacco-header">
                    <h2>{b.nome}</h2>
                    <Image
                      src={likedBivacchi[b._id] ? "/heart2.png" : "/heart.png"}
                      alt="Like"
                      width={25}
                      height={25}
                      className="heart-icon"
                      onClick={() => toggleLikeBivacco(b._id)}
                    />
                  </div>
                  <p><strong>Località:</strong> {b.localita}</p>
                  <p><strong>Sentiero:</strong> {b.sentiero}</p>
                  <p><strong>Altezza:</strong> {b.altezza} m</p>
                  <p><strong>Capienza:</strong> {b.capienza} persone</p>
                  <p><strong>Descrizione:</strong> {b.descrizione}</p>
                  <p><strong>Coordinate:</strong> {b.latitudine}, {b.longitudine}</p>
                </div>
              ))
            : filteredPercorsi.map((p) => (
                <div key={p._id} className="percorsi-card">
                  <div className="percorsi-header">
                    <h2>{p.nome}</h2>
                    <Image
                      src={likedPercorsi[p._id] ? "/heart2.png" : "/heart.png"}
                      alt="Like"
                      width={25}
                      height={25}
                      className="heart-icon"
                      onClick={() => toggleLikePercorso(p._id)}
                    />
                  </div>
                  <p><strong>Località:</strong> {p.localita}</p>
                  <p><strong>Sentiero:</strong> {p.sentiero}</p>
                  <p><strong>Difficoltà:</strong> {p.difficolta}</p>
                  <p><strong>Pendenza Massima:</strong> {p.pendenza_massima}</p>
                  <p><strong>Lunghezza:</strong> {p.lunghezza}</p>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}
