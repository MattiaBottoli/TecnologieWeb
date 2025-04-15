"use client"

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

interface Percorso {
    _id: string;
    nome: string;
    localita: string;
    sentiero: string;
    difficolta: string;
    pendenza_massima: string;
    lunghezza: string;
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

  interface Prenotazione {
    mail: string;
    data: string;
    percorso: string;
    bivacco: string;
  }

export default function PrenotazioneEscursione() {
    
  const [date, setDate] = useState<string>("");
  const [selectedPercorso, setSelectedPercorso] = useState<string>("");
  const [selectedBivacco, setSelectedBivacco] = useState<string>("");
  const [percorsi, setPercorsi] = useState<Percorso[]>([]);
  const [bivacchi, setBivacchi] = useState<Bivacco[]>([]);
  const { isLoggedIn, email } = useAuth();
  const [error, setError] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn){
      fetch("http://localhost:5000/api/percorsi")
      .then((res) => res.json())
      .then((data) => setPercorsi(data))
      .catch((error) => console.error("Errore nel recupero dei dati:", error));
    fetch("http://localhost:5000/api/bivacchi")
      .then((res) => res.json())
      .then((data) => setBivacchi(data))
      .catch((error) => console.error("Errore nel recupero dei dati:", error));
    }
    else
      router.push("/registrati");
    
  }, [isLoggedIn]);
   
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/programmi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mail: email,
          data: date,
          percorso: selectedPercorso,
          bivacco: selectedBivacco,
        }),
      });

      const data: { message: string; user?: Prenotazione } = await response.json();

      if (response.ok) {
        router.push("/prenotazioni");
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError("Errore nella connessione al server");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <h1 className="text-xl font-bold mb-4">Programma un'Escursione</h1>
        <form onSubmit={handleSubmit}>
        <fieldset>
            <section>
                <label>Data</label>
                <input type="date"
                onChange={(e) => setDate(e.target.value)}
                required/>
            </section>
            <br/>
            <section>
                <label>Scegli un percorso: </label>
                <select value={selectedPercorso}
                onChange={(e) => setSelectedPercorso(e.target.value)}
                required>
                    {percorsi.map((percorsi) => (
                        <option key={percorsi._id}>{percorsi.nome}</option>
                    ))}
                </select>
            </section>
            <br/>
            <section>
                <label>Scegli un bivacco: </label>
                <select value={selectedBivacco}
                onChange={(e) => setSelectedBivacco(e.target.value)}
                required>
                    {bivacchi.map((bivacchi) => (
                        <option key={bivacchi._id} >{bivacchi.nome}</option>
                    ))}
                </select>
            </section>
            <br/>
            <section>
                <button type="submit">INVIA</button>
            </section>
        </fieldset>
        </form>
    </div>
  );
}
