"use client";

import { useState, useEffect, useCallback } from "react"; // Aggiunto useCallback
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext"; // Percorso corretto

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
  const searchParams = useSearchParams();
  const router = useRouter();
  const { email, isLoggedIn } = useAuth(); // Utilizzo delle proprietà email e isLoggedIn

  const [view, setView] = useState<"bivacchi" | "percorsi" | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [bivacchi, setBivacchi] = useState<Bivacco[]>([]);
  const [likedBivacchi, setLikedBivacchi] = useState<{ [id: string]: boolean }>({});

  const [percorsi, setPercorsi] = useState<Percorso[]>([]);
  const [likedPercorsi, setLikedPercorsi] = useState<{ [id: string]: boolean }>({});

  // Effect per leggere il parametro 'view' dall'URL
  useEffect(() => {
    const initialViewParam = searchParams.get("view");
    if (initialViewParam) {
      const initialView = initialViewParam as "bivacchi" | "percorsi";
      if (initialView === "bivacchi" || initialView === "percorsi") {
        setView(initialView);
      }
    }
  }, [searchParams]);

  // **Funzione per caricare i preferiti dell'utente dal server**
  // Resa con useCallback per evitare ricreazioni inutili
  const fetchUserFavorites = useCallback(async (userEmail: string, currentBivacchi: Bivacco[], currentPercorsi: Percorso[]) => {
    try {
      const response = await fetch(`http://localhost:5000/api/user/favorites`, {
        headers: {
          "user_email": userEmail, // Invia l'email dell'utente nell'header
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch user favorites.");
      }
      const data = await response.json();
      const userFavorites: string[] = data.favorites || [];

      const newLikedBivacchi: { [id: string]: boolean } = {};
      const newLikedPercorsi: { [id: string]: boolean } = {};

      userFavorites.forEach((favId) => {
        // Popola gli stati likedBivacchi e likedPercorsi basandosi sui dati correntemente caricati
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
  }, []); // Dipendenze vuote perché i dati sono passati come argomenti

  // **Effect principale per caricare tutti i dati**
  useEffect(() => {
    const loadBivacchi = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/bivacchi");
        const data = await res.json();
        setBivacchi(data);
        return data; // Ritorna i dati caricati
      } catch (err) {
        console.error("Errore nel caricamento dei bivacchi:", err);
        alert("Errore nel caricamento dei bivacchi");
        return [];
      }
    };

    const loadPercorsi = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/percorsi");
        const data = await res.json();
        setPercorsi(data);
        return data; // Ritorna i dati caricati
      } catch (err) {
        console.error("Errore nel caricamento dei percorsi:", err);
        alert("Errore nel caricamento dei percorsi");
        return [];
      }
    };

    const initializeDataAndFavorites = async () => {
      let loadedBivacchi: Bivacco[] = [];
      let loadedPercorsi: Percorso[] = [];

      // Carica i dati in base alla vista
      if (view === "bivacchi") {
        loadedBivacchi = await loadBivacchi();
      } else if (view === "percorsi") {
        loadedPercorsi = await loadPercorsi();
      } else {
        // Se non c'è una vista selezionata, potresti voler caricare entrambi o nessuno
        // Per ora, non facciamo nulla finché view non è selezionata
        return;
      }

      // Ora che i dati base sono caricati, possiamo tentare di caricare i preferiti
      if (isLoggedIn && email) {
        // Passa i dati appena caricati alla funzione fetchUserFavorites
        fetchUserFavorites(email, loadedBivacchi, loadedPercorsi);
      } else if (!isLoggedIn) {
        // Se l'utente non è loggato, pulisci i preferiti locali
        setLikedBivacchi({});
        setLikedPercorsi({});
      }
    };

    initializeDataAndFavorites();
    // Questo useEffect si esegue quando view, isLoggedIn, o email cambiano
    // o quando la funzione fetchUserFavorites cambia (se non fosse useCallback)
  }, [view, isLoggedIn, email, fetchUserFavorites]); // Aggiunto fetchUserFavorites alle dipendenze

  // Funzione per gestire l'aggiunta/rimozione dei preferiti sul server
  const handleToggleFavorite = async (itemId: string, itemType: "bivacco" | "percorso", currentLikedState: boolean) => {
    if (!isLoggedIn || !email) {
      alert("Devi essere loggato per aggiungere/rimuovere preferiti!");
      return;
    }

    // Aggiornamento ottimistico dell'UI: cambia il cuore immediatamente
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
          "user_email": email, // Invia l'email dell'utente nell'header
        },
        body: JSON.stringify({
          itemId,
          action: currentLikedState ? "remove" : "add", // Determina l'azione corretta
        }),
      });

      if (!response.ok) {
        // Se il server fallisce, ripristina lo stato precedente dell'UI
        if (itemType === "bivacco") {
          setLikedBivacchi((prev) => ({ ...prev, [itemId]: currentLikedState }));
        } else {
          setLikedPercorsi((prev) => ({ ...prev, [itemId]: currentLikedState }));
        }
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update favorite on server.");
      }

      const result = await response.json();
      console.log("Risposta del server:", result.message);

    } catch (error) {
      console.error("Errore nell'aggiornamento dei preferiti:", error);
      alert(`Errore nell'aggiornamento dei preferiti: ${error instanceof Error ? error.message : String(error)}`);
      // Assicurati che l'UI rifletta lo stato corretto se l'aggiornamento ottimistico è fallito
      if (itemType === "bivacco") {
        setLikedBivacchi((prev) => ({ ...prev, [itemId]: currentLikedState }));
      } else {
        setLikedPercorsi((prev) => ({ ...prev, [itemId]: currentLikedState }));
      }
    }
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
    <div className="Bivacco-Container">
      <div className={`active-view-${view}`}>
        <div className={`${view}-container`}>
          <h1 className={`${view}-title`}>Elenco dei {view === "bivacchi" ? "Bivacchi" : "Percorsi"}</h1>

          <h3><p><a href="#" onClick={() => setView(null)}>Torna Alla Selezione</a></p></h3>
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
                    {/* Heart icon, disabled if not logged in */}
                    <Image
                      src={likedBivacchi[b._id] ? "/heart2.png" : "/heart.png"}
                      alt="Like"
                      width={25}
                      height={25}
                      className={`heart-icon ${!isLoggedIn ? "disabled-heart" : ""}`}
                      onClick={() => isLoggedIn && handleToggleFavorite(b._id, "bivacco", !!likedBivacchi[b._id])}
                      style={{ cursor: isLoggedIn ? 'pointer' : 'not-allowed' }}
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
                    {/* Heart icon, disabled if not logged in */}
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
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}