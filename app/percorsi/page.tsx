"use client";

import "../../styles/bivacchi.css";
import { useEffect, useState } from "react";
import Image from "next/image";

interface Percorso {
  _id: string;
  nome: string;
  localita: string;
  sentiero: string;
  difficolta: string;
  pendenza_massima: string;
  lunghezza: string;
}

export default function Page() {
  const [percorsi, setPercorsi] = useState<Percorso[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [likedPercorsi, setLikedPercorsi] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetch("http://localhost:5000/api/percorsi")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Errore HTTP! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => setPercorsi(data))
      .catch((error) => {
        console.error("Errore nel recupero dei dati:", error);
        alert(`Errore nel recupero dei dati: ${error.message}`);
      });

    // Recupera i cuori salvati dal localStorage
    const savedLikes = JSON.parse(localStorage.getItem("likedPercorsi") || "{}");
    setLikedPercorsi(savedLikes);
  }, []);

  // Funzione per gestire il like
  const toggleLike = (id: string) => {
    setLikedPercorsi((prev) => {
      const updatedLikes = { ...prev, [id]: !prev[id] };
      localStorage.setItem("likedPercorsi", JSON.stringify(updatedLikes)); // Salva lo stato nel localStorage
      return updatedLikes;
    });
  };

  // Filtra i percorsi in base alla ricerca
  const percorsiFiltrati = percorsi.filter((percorso) =>
    percorso.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="percorsi-container">
      <h1 className="percorsi-title">Elenco dei Percorsi</h1>

      {/* Sezione di ricerca */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Cerca un percorso..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Lista dei percorsi */}
      <div className="percorsi-grid">
        {percorsiFiltrati.length > 0 ? (
          percorsiFiltrati.map((percorso) => (
            <div key={percorso._id} className="percorsi-card">
              <div className="percorsi-header">
                <h2>{percorso.nome}</h2>
                <Image
                  src={likedPercorsi[percorso._id] ? "/heart2.png" : "/heart.png"}
                  alt="Like"
                  width={25}
                  height={25}
                  className="heart-icon"
                  onClick={() => toggleLike(percorso._id)}
                />
              </div>
              <p><strong>Località:</strong> {percorso.localita}</p>
              <p><strong>Sentiero:</strong> {percorso.sentiero}</p>
              <p><strong>Difficoltà:</strong> {percorso.difficolta}</p>
              <p><strong>Pendenza Massima:</strong> {percorso.pendenza_massima}</p>
              <p><strong>Lunghezza:</strong> {percorso.lunghezza}</p>
            </div>
          ))
        ) : (
          <p className="no-results">Nessun percorso trovato</p>
        )}
      </div>
    </div>
  );
}