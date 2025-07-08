"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext"; // Assumendo che questo percorso sia corretto
import Link from "next/link";
import Image from "next/image";

// Definisci l'interfaccia per un Bivacco
interface Bivacco {
  _id: string;
  nome: string;
  descrizione?: string;
  altitudine: number;
  immagineUrl?: string; // Reso opzionale
  localita?: string; // Aggiunto per potenziale visualizzazione
  type: 'bivacco'; // Campo aggiunto dal backend per distinguere
}

// Definisci l'interfaccia per un Percorso
interface Percorso {
  _id: string;
  nome: string;
  difficolta: string;
  durata: string;
  immagineUrl?: string; // Se i percorsi hanno immagini
  type: 'percorso'; // Campo aggiunto dal backend per distinguere
}

interface User {
  _id: string;
  nome: string;
  cognome: string;
  username: string;
  mail: string;
  tesserato: boolean;
  tesseraImg?: string;
  preferiti: string[]; // Array di ID dei bivacchi/percorsi preferiti
  postati: {
    titolo: string;
    tipo: "bivacco" | "percorso";
    data: string;
  }[];
}

export default function ProfiloUtentePage() {
  const { email, logout, isLoggedIn } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteMode, setDeleteMode] = useState(false);
  const [favoriteBivacchi, setFavoriteBivacchi] = useState<Bivacco[]>([]);
  const [favoritePercorsi, setFavoritePercorsi] = useState<Percorso[]>([]); // Nuovo stato per i dettagli dei percorsi preferiti
  const router = useRouter();

  useEffect(() => {
    const fetchUserAndFavorites = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!isLoggedIn) {
          router.push("/login");
          return;
        }
        if (!email) {
          setError("Email utente non disponibile. Effettua nuovamente il login.");
          setIsLoading(false);
          router.push("/login");
          return;
        }

        // 1. Fetch Utente e Preferiti in parallelo
        const [userRes, favoritesRes] = await Promise.all([
          fetch(`http://localhost:5000/api/utente/${email}`),
          fetch('http://localhost:5000/api/user/favorites', {
            headers: { 'user_email': email }
          })
        ]);

        if (!userRes.ok) {
          console.error(`Errore nel recupero dati utente: ${userRes.status}`);
          throw new Error("Errore nel recupero dei dati utente.");
        }
        if (!favoritesRes.ok) {
          console.error(`Errore nel recupero preferiti: ${favoritesRes.status}`);
          throw new Error("Errore nel recupero dei preferiti.");
        }

        const userData: { user: User } = await userRes.json();
        // favoritesData.favorites conterrà sia bivacchi che percorsi con il campo 'type'
        const favoritesData: { favorites: (Bivacco | Percorso)[] } = await favoritesRes.json();

        setUser(userData.user);

        // Separa i preferiti in base al loro 'type'
        const bivacchi = favoritesData.favorites.filter((item): item is Bivacco => item.type === 'bivacco');
        const percorsi = favoritesData.favorites.filter((item): item is Percorso => item.type === 'percorso');

        setFavoriteBivacchi(bivacchi);
        setFavoritePercorsi(percorsi);

      } catch (err: any) {
        console.error("Errore durante il fetch di utente e preferiti:", err);
        setError(err.message || "Si è verificato un errore inaspettato. Riprova più tardi.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndFavorites();
  }, [email, isLoggedIn, router]);

  const confirmDelete = async (id: string) => {
    try {
      const response = await fetch("http://localhost:5000/api/profilo/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", id_prenotazione: id },
      });
      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message);

      alert(data.message);
      logout();
      router.push("/registrati");
    } catch (err: any) {
      console.error("Errore nell'eliminazione dell'Account:", err);
    }
  };

  const handleModifica = (idUtente: string) => {
    router.push(`/profilo/modifica?idUtente=${idUtente}`);
  };

  if (isLoading) return <p>Caricamento profilo...</p>;

  if (!user) {
    return (
      <div className="container">
        <h2>Utente non trovato</h2>
        <p>Devi essere loggato per vedere il tuo profilo.</p>
        <Link href="/login"><button className="btnlog">Login</button></Link>
      </div>
    );
  }

  return (
    <div className="Profilo-Container">
      <h1>I TUOI DATI</h1>

      <div className="profile-section">
        <p><strong>Nome:</strong> {user.nome}</p>
        <p><strong>Cognome:</strong> {user.cognome}</p>
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.mail}</p>
        <p><strong>Tesserato:</strong> {user.tesserato ? "✅ Sì" : "❌ No"}</p>

        {user.tesserato && user.tesseraImg && (
          <div className="tessera">
            <Image src={user.tesseraImg} alt="Tessera" width={220} height={140} />
            <p className="note">La tua tessera digitale</p>
          </div>
        )}

        {!deleteMode ? (
          <>
            <button onClick={() => handleModifica(user._id)}>Modifica profilo</button>
            <button className="delete-mode" onClick={() => setDeleteMode(!deleteMode)}>Rimuovi Account</button>
          </>
        ) : (
          <>
            <h1>Sei sicuro?</h1>
            <button onClick={() => confirmDelete(user._id)}>SI</button>
            <button onClick={() => setDeleteMode(false)}>NO</button>
          </>
        )}
      </div>
      <hr />
      {user.tesserato ? (
        <>
          <h1>SEZIONE TESSERATO</h1>
          <section className="post-form">
            <p>RICORDI: Visualizza le tue vecchie escursioni.</p>
            <Link href={("/ricordi")}>
              <button>Vai a Ricordi</button>
            </Link>
          </section>

          <section>
            <div className="profile-section">
              <p>PREFERITI: Questi sono i tuoi bivacchi e percorsi preferiti: </p>
              {error && <p style={{ color: "red" }}>{error}</p>}

              {/* Sezione Bivacchi Preferiti */}
              <h2 className="text-xl font-semibold text-gray-700 mt-6 mb-4">Bivacchi Preferiti</h2>
              {favoriteBivacchi.length > 0 ? (
                <div className="preferiti-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoriteBivacchi.map((bivacco) => (
                    <div key={bivacco._id} className="bivacco-card bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                      {bivacco.immagineUrl && (
                        <Image src={bivacco.immagineUrl} alt={bivacco.nome} width={200} height={150} className="w-full h-32 object-cover mb-3 rounded" />
                      )}
                      <h3 className="text-lg font-bold mb-1 text-gray-800">{bivacco.nome}</h3>
                      <p className="text-gray-600 text-sm">Altitudine: {bivacco.altitudine}m</p>
                      {bivacco.localita && <p className="text-gray-600 text-sm">Località: {bivacco.localita}</p>}
                      <Link href={`/bivacchi`}>
                        <button className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 w-full">
                          Vedi Dettagli
                        </button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">Nessun bivacco preferito trovato.</p>
              )}

              {/* Sezione Percorsi Preferiti */}
              <h2 className="text-xl font-semibold text-gray-700 mt-8 mb-4">Percorsi Preferiti</h2>
              {favoritePercorsi.length > 0 ? (
                <div className="preferiti-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoritePercorsi.map((percorso) => (
                    <div key={percorso._id} className="percorso-card bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                      {percorso.immagineUrl && (
                        <Image src={percorso.immagineUrl} alt={percorso.nome} width={200} height={150} className="w-full h-32 object-cover mb-3 rounded" />
                      )}
                      <h3 className="text-lg font-bold mb-1 text-gray-800">{percorso.nome}</h3>
                      <p className="text-gray-600 text-sm">Difficoltà: {percorso.difficolta}</p>
                      <p className="text-gray-600 text-sm">Durata: {percorso.durata}</p>
                      <Link href={`/bivacchi`}>
                        <button className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300 w-full">
                          Vedi Dettagli
                        </button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">Nessun percorso preferito trovato.</p>
              )}

              <p className="mt-8">Scopri quale sarà la tua prossima meta! {" "}
                <Link href="/bivacchi" className="text-blue-500 hover:underline">CLICCA QUI</Link>
              </p>
              <p>Sei pronto a programmare un'escursione? {" "}
                <Link href="/programmazione" className="text-blue-500 hover:underline">CLICCA QUI</Link>
              </p>

            </div>
          </section>
        </>

      ) : (
        <section className="tesseramento-box">
          <h1 className="warning-text">Tesserati per accedere alle sezione esclusiva!</h1>
          <Link href={`/profilo/pagamento?mail=${encodeURIComponent(user.mail)}`}>
            <button className="btnlog">Tesserati ora</button>
          </Link>
        </section>
      )}
      <hr />
    </div>
  );
}
