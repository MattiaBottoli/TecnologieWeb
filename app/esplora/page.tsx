"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import "../../styles/loginregistrati.css"

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
    if (!isLoggedIn) {
      router.push("/registrati");
      return;
    }

    fetch("http://localhost:5000/api/percorsi")
      .then((res) => res.json())
      .then((data) => {
        setPercorsi(data);
        if (data.length > 0) setSelectedPercorso(data[0].nome);
      })
      .catch((error) => console.error("Errore nel recupero dei percorsi:", error));

    fetch("http://localhost:5000/api/bivacchi")
      .then((res) => res.json())
      .then((data) => {
        setBivacchi(data);
        if (data.length > 0) setSelectedBivacco(data[0].nome);
      })
      .catch((error) => console.error("Errore nel recupero dei bivacchi:", error));
  }, [isLoggedIn, router]);

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
    <div className="container">
      <header>
        <h1>Programma un'Escursione</h1>
      </header>
      
      {error && <p style={{color: "red"}}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <section>
          <label>DATA</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </section>
        <br/>
        <section>
        <label>PERCORSO</label>
          <select
            value={selectedPercorso}
            onChange={(e) => setSelectedPercorso(e.target.value)}
            required
          >
            {percorsi.map((percorso) => (
              <option key={percorso._id} value={percorso.nome}>
                {percorso.nome}
              </option>
            ))}
          </select>
        </section>
        <br/>
        <section>
          <label>BIVACCO</label>
          <select
            value={selectedBivacco}
            onChange={(e) => setSelectedBivacco(e.target.value)}
            required
          >
            {bivacchi.map((bivacco) => (
              <option key={bivacco._id} value={bivacco.nome}>
                {bivacco.nome}
              </option>
            ))}
          </select>
        </section>
        <br/>
        <section>
          <button type="submit">INVIA</button>
        </section>
      </form>
    </div>
  );
}