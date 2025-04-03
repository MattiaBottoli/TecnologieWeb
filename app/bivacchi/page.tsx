"use client";
import "../../styles/bivacchi.css"; // Importa il CSS
import { useEffect, useState } from "react";
import Image from "next/image";

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

export default function Page() {
  const [bivacchi, setBivacchi] = useState<Bivacco[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [likedBivacchi, setLikedBivacchi] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetch("http://localhost:5000/api/bivacchi")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Errore HTTP! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => setBivacchi(data))
      .catch((error) => {
        console.error("Errore nel recupero dei dati:", error);
        alert(`Errore nel recupero dei dati: ${error.message}`);
      });

    // Recupera i cuori salvati dal localStorage
    const savedLikes = JSON.parse(localStorage.getItem("likedBivacchi") || "{}");
    setLikedBivacchi(savedLikes);
  }, []);

  // Funzione per gestire il like
  const toggleLike = (id: string) => {
    setLikedBivacchi((prev) => {
      const updatedLikes = { ...prev, [id]: !prev[id] };
      localStorage.setItem("likedBivacchi", JSON.stringify(updatedLikes)); // Salva lo stato nel localStorage
      return updatedLikes;
    });
  };

  // Filtra i bivacchi in base alla ricerca
  const bivacchiFiltrati = bivacchi.filter((bivacco) =>
    bivacco.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bivacchi-container">
      <h1 className="bivacchi-title">Elenco dei Bivacchi</h1>

      {/* Sezione di ricerca */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Cerca un bivacco..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Lista dei bivacchi */}
      <div className="bivacchi-grid">
        {bivacchiFiltrati.length > 0 ? (
          bivacchiFiltrati.map((bivacco) => (
            <div key={bivacco._id} className="bivacco-card">
              <div className="bivacco-header">
                <h2>{bivacco.nome}</h2>
                <Image
                  src={likedBivacchi[bivacco._id] ? "/heart2.png" : "/heart.png"}
                  alt="Like"
                  width={25}
                  height={25}
                  className="heart-icon"
                  onClick={() => toggleLike(bivacco._id)}
                />
              </div>
              <p><strong>Località:</strong> {bivacco.localita}</p>
              <p><strong>Sentiero:</strong> {bivacco.sentiero}</p>
              <p><strong>Altezza:</strong> {bivacco.altezza} m</p>
              <p><strong>Capienza:</strong> {bivacco.capienza} persone</p>
              <p><strong>Descrizione:</strong> {bivacco.descrizione}</p>
              <p><strong>Coordinate:</strong> {bivacco.latitudine}, {bivacco.longitudine}</p>
            </div>
          ))
        ) : (
          <p className="no-results">Nessun bivacco trovato</p>
        )}
      </div>
    </div>
  );
}
