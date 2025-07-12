"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

// Define a separate interface for review objects to be clear
interface Review {
  userEmail: string;
  voto: number;
}

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
  recensioni?: Review[]; // MODIFIED: Now an array of Review objects
}

export default function HomePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { email, isLoggedIn, tesserato } = useAuth();

  const [view, setView] = useState<"bivacchi" | "percorsi" | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [bivacchi, setBivacchi] = useState<Bivacco[]>([]);
  const [likedBivacchi, setLikedBivacchi] = useState<{ [id: string]: boolean }>({});

  const [percorsi, setPercorsi] = useState<Percorso[]>([]);
  const [likedPercorsi, setLikedPercorsi] = useState<{ [id: string]: boolean }>({});

  useEffect(() => {
    const initialViewParam = searchParams.get("view");
    if (initialViewParam) {
      const initialView = initialViewParam as "bivacchi" | "percorsi";
      if (initialView === "bivacchi" || initialView === "percorsi") {
        setView(initialView);
      }
    }
  }, [searchParams]);

  const fetchUserFavorites = useCallback(async (userEmail: string, currentBivacchi: Bivacco[], currentPercorsi: Percorso[]) => {
    try {
      const response = await fetch(`http://localhost:5000/api/user/favorites`, {
        headers: {
          "user_email": userEmail,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch user favorites.");
      const data = await response.json();
      const userFavorites: string[] = data.favorites || [];

      const newLikedBivacchi: { [id: string]: boolean } = {};
      const newLikedPercorsi: { [id: string]: boolean } = {};

      userFavorites.forEach((favId) => {
        if (currentBivacchi.some(b => b._id === favId)) {
          newLikedBivacchi[favId] = true;
        } else if (currentPercorsi.some(p => p._id === favId)) {
          newLikedPercorsi[favId] = true;
        }
      });

      setLikedBivacchi(newLikedBivacchi);
      setLikedPercorsi(newLikedPercorsi);

    } catch (error) {
      console.error("Errore nel recupero dei preferiti dell'utente:", error);
    }
  }, []);

  useEffect(() => {
    const loadBivacchi = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/bivacchi");
        const data = await res.json();
        setBivacchi(data);
        return data;
      } catch (err) {
        console.error("Errore nel caricamento dei bivacchi:", err);
        return [];
      }
    };

    const loadPercorsi = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/percorsi");
        const data = await res.json();
        setPercorsi(data);
        return data;
      } catch (err) {
        console.error("Errore nel caricamento dei percorsi:", err);
        return [];
      }
    };

    const initializeDataAndFavorites = async () => {
      let loadedBivacchi: Bivacco[] = [];
      let loadedPercorsi: Percorso[] = [];

      if (view === "bivacchi") {
        loadedBivacchi = await loadBivacchi();
      } else if (view === "percorsi") {
        loadedPercorsi = await loadPercorsi();
      } else {
        return;
      }

      if (isLoggedIn && email) {
        fetchUserFavorites(email, loadedBivacchi, loadedPercorsi);
      } else {
        setLikedBivacchi({});
        setLikedPercorsi({});
      }
    };

    initializeDataAndFavorites();
  }, [view, isLoggedIn, email, fetchUserFavorites]);

  const handleToggleFavorite = async (itemId: string, itemType: "bivacco" | "percorso", currentLikedState: boolean) => {
    if (!isLoggedIn || !email) {
      alert("Devi essere loggato per aggiungere ai preferiti.");
      return;
    }
    if (!tesserato) {
      alert("Devi essere un utente tesserato per aggiungere ai preferiti.");
      return;
    }

    if (itemType === "bivacco") {
      setLikedBivacchi((prev) => ({ ...prev, [itemId]: !currentLikedState }));
    } else {
      setLikedPercorsi((prev) => ({ ...prev, [itemId]: !currentLikedState }));
    }

    try {
      const response = await fetch("http://localhost:5000/api/user/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "user_email": email,
        },
        body: JSON.stringify({
          itemId,
          action: currentLikedState ? "remove" : "add",
        }),
      });

      if (!response.ok) {
        if (itemType === "bivacco") {
          setLikedBivacchi((prev) => ({ ...prev, [itemId]: currentLikedState }));
        } else {
          setLikedPercorsi((prev) => ({ ...prev, [itemId]: currentLikedState }));
        }
        throw new Error("Errore di aggiornamento preferiti.");
      }
    } catch (error) {
      console.error("Errore nell'aggiornamento dei preferiti:", error);
    }
  };

  const percorsoIdParam = searchParams.get("id");

  const filteredBivacchi = bivacchi.filter((b) =>
    b.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPercorsi = percorsi.filter((p) => {
    const matchesSearch = p.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesId = !percorsoIdParam || p._id === percorsoIdParam;
    return matchesSearch && matchesId;
  });

  if (!view) {
    return (
      <div className="view-selector">
        <h1 className="welcome-title">Benvenuto!</h1>
        <p className="welcome-text">Scegli cosa vuoi cercare:</p>
        <button className="view-button" onClick={() => setView("bivacchi")}>Cerca Bivacco</button>
        <button className="view-button" onClick={() => setView("percorsi")}>Cerca Sentiero</button>
      </div>
    );
  }

  return (
    <div className="Bivacco-Container">
      <div className={`active-view-${view}`}>
        <div className={`${view}-container`}>
          <h1 className={`${view}-title`}>Elenco dei {view === "bivacchi" ? "Bivacchi" : "Percorsi"}</h1>

          <h3>
            <a href="#" onClick={(e) => { e.preventDefault(); setView(null); router.push('/bivacchi'); }}>Torna Alla Selezione</a>
          </h3>

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
                  <div
                    key={b._id}
                    className="bivacco-card"
                    onClick={() => router.push(`/bivacchi/${b._id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="bivacco-header">
                      <h2>{b.nome}</h2>
                      <Image
                        src={likedBivacchi[b._id] ? "/heart2.png" : "/heart.png"}
                        alt="Like"
                        width={25}
                        height={25}
                        className={`heart-icon ${(!isLoggedIn || !tesserato) ? "disabled-heart" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isLoggedIn && tesserato) {
                            handleToggleFavorite(b._id, "bivacco", !!likedBivacchi[b._id]);
                          }
                        }}
                        style={{ cursor: (isLoggedIn && tesserato) ? 'pointer' : 'not-allowed' }}
                      />
                    </div>
                    <p><strong>Località:</strong> {b.localita}</p>
                    <p><strong>Sentiero:</strong> {b.sentiero}</p>
                    <p><strong>Altezza:</strong> {b.altezza} m</p>
                    <p><strong>Capienza:</strong> {b.capienza} persone</p>
                    <p><strong>Coordinate:</strong> {b.latitudine}, {b.longitudine}</p>
                  </div>
                ))
              : filteredPercorsi.map((p) => {
                  // Calcolo della media dei voti per i percorsi, includendo il filtro per numeri validi
                  // Accessing 'r.voto' because recensioni is now an array of objects
                  const votiNumerici = p.recensioni?.map(r => r.voto).filter(v => typeof v === 'number') ?? [];
                  const media = votiNumerici.length > 0 ? votiNumerici.reduce((a, b) => a + b, 0) / votiNumerici.length : 0;
                  const stellePiene = Math.round(media);

                  return (
                    <div key={p._id} className="percorsi-card">
                      <div className="percorsi-header">
                        <h2>{p.nome}</h2>
                        <Image
                          src={likedPercorsi[p._id] ? "/heart2.png" : "/heart.png"}
                          alt="Like"
                          width={25}
                          height={25}
                          className={`heart-icon ${!isLoggedIn ? "disabled-heart" : ""}`}
                          onClick={() => isLoggedIn && handleToggleFavorite(p._id, "percorso", !!likedPercorsi[p._id])}
                          style={{ cursor: isLoggedIn ? 'pointer' : 'not-allowed' }}
                        />
                      </div>
                      <p><strong>Località:</strong> {p.localita}</p>
                      <p><strong>Sentiero:</strong> {p.sentiero}</p>
                      <p><strong>Difficoltà:</strong> {p.difficolta}</p>
                      <p><strong>Pendenza Massima:</strong> {p.pendenza_massima}</p>
                      <p><strong>Lunghezza:</strong> {p.lunghezza}</p>
                      <p><strong>Recensione dei nostri Utenti:</strong></p>
                      <div className="recensioni-stars">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i}>
                            {i < stellePiene ? "★" : "☆"}
                          </span>
                        ))}
                        <span className="media-voto"> ({media.toFixed(1)})</span>
                      </div>
                    </div>
                  );
                })}
          </div>
        </div>
      </div>
    </div>
  );
}