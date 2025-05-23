"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
///import "../../../styles/loginregistrati.css";

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
  _id: string;
  mail: string;
  data: string;
  percorso: string;
  bivacco: string;
  fasciaOraria: string;
  numpartecipanti: number; 
}

export default function PrenotazioneEscursione() {
  const [mode, setMode] = useState<string>("setPercorso");
  const [date, setDate] = useState<string>("");
  const [partecipanti, setPartecipanti] = useState<number>(1);
  const [selectedPercorso, setSelectedPercorso] = useState<string>("");
  const [selectedBivacco, setSelectedBivacco] = useState<string>("");
  const [fasciaOraria, setFasciaOraria] = useState<string>("");
  const [percorsi, setPercorsi] = useState<Percorso[]>([]);
  const [bivacchi, setBivacchi] = useState<Bivacco[]>([]);
  const [prenotazioni, setPrenotazioni] = useState<Prenotazione[]>([]);
  const { isLoggedIn, email } = useAuth();
  const [error, setError] = useState<string>("");
  const router = useRouter();

  const fasceOrarie = [
    "9:00-10:00", "10:00-11:00", "12:00-13:00", 
    "14:00-15:00", "15:00-16:00", "16:00-17:00", 
    "18:00-19:00", "19:00-20:00", "20:00-21:00"
  ];

  const today = new Date().toISOString().split('T')[0];

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
      })
      .catch((error) => console.error("Errore nel recupero dei bivacchi:", error));
  }, [isLoggedIn, router]);

  useEffect(() => {
    if (mode === "setBivacco" && selectedBivacco && date) {
      fetchPrenotazioni();
    }
  }, [selectedBivacco, date, mode]);

  const fetchPrenotazioni = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/prenotazioni?bivacco=${selectedBivacco}&data=${date}`);
      const data = await res.json();
      setPrenotazioni(data);
    } catch (error) {
      console.error("Errore nel recupero delle prenotazioni:", error);
    }
  };

  const changeMode = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMode("setBivacco");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/programmi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mail: email,
          numpartecipanti: partecipanti,
          data: date,
          percorso: selectedPercorso,
          bivacco: selectedBivacco,
          fasciaOraria: fasciaOraria
        }),
      });

      const data: { message: string; user?: Prenotazione } = await response.json();

      if (response.ok) {
        alert("Prenotazione effettuata con successo!");
        router.push("/escursioni");
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError("Errore nella connessione al server");
    }
  };

  const postiDisponibili = (fascia: string) => {
    const bivacco = bivacchi.find(b => b.nome === selectedBivacco);
    if (!bivacco) return 0;
    const prenotati = prenotazioni
      .filter(p => p.fasciaOraria === fascia)
      .reduce((sum, p) => sum + p.numpartecipanti, 0);
    return bivacco.capienza - prenotati;
  };

  const handleIndietro = () => {
    setSelectedBivacco("");
    setFasciaOraria("");
    setMode("setPercorso");
  }

  return (
    <div className="container">
      <header>
        <h1>Programma un'Escursione</h1>
      </header>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {mode === "setPercorso" ? (
        <form onSubmit={changeMode}>
          <section>
            <p>Seleziona la data, il numero di partecipanti e il percorso.</p>
          </section>
          <section>
            <label>Data</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              min={today}
            />
          </section>
          <br />
          <section>
            <label>Numero Partecipanti</label>
            <input 
              type="number"
              value={partecipanti}
              onChange={(e) => setPartecipanti(e.target.valueAsNumber)}
              required
            />
          </section>
          <br/>
          <section>
            <label>Percorso</label>
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
          <br />
          <section>
            <button type="submit">AVANTI</button>
          </section>
        </form>
      ) : (
        <form onSubmit={handleSubmit}>
          <section>
            <p>
              Seleziona il bivacco/rifugio e la fascia oraria nel quale desiderate accamparvi.
              Vi consigliamo i bivacchi che si trovano nella stessa localitÃ  del percorso selezionato.
            </p>
          </section>
          <br />
          <section>
            <label>BIVACCO</label>
            <select
              value={selectedBivacco}
              onChange={(e) => setSelectedBivacco(e.target.value)}
              required
            >
              <option value="">SELEZIONA UN BIVACCO</option>
              {bivacchi
                .filter((bivacco) => bivacco.localita === percorsi.find((p) => p.nome === selectedPercorso)?.localita)
                .map((bivacco) => (
                  <option key={bivacco._id} value={bivacco.nome}>
                    {bivacco.nome}
                  </option>
                ))}
            </select>
          </section>
          {selectedBivacco != "" && (
            <section>
              <h2>Fasce Orarie Disponibili</h2>
              <table className="fasce-orarie">
                <thead>
                  <tr>
                    <th>Fascia Oraria</th>
                    <th>Posti Disponibili</th>
                    <th>Seleziona</th>
                  </tr>
                </thead>
                <tbody>
                  {fasceOrarie.map((fascia) => {
                    const disponibili = postiDisponibili(fascia);
                    return (
                      <tr key={fascia}>
                        <td>{fascia}</td>
                        <td>{disponibili}</td>
                        <td>
                          <button 
                            type="button"
                            disabled={disponibili < partecipanti}
                            onClick={() => setFasciaOraria(fascia)}
                            style={{ backgroundColor: fasciaOraria === fascia ? "lightgreen" : undefined }}
                          >
                            {fasciaOraria === fascia ? "Selezionato" : ""}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          )}
          <br />
          <footer>
            <button type="submit" disabled={!fasciaOraria}>INVIA</button>
          </footer>
        </form>
      )}
      {mode === "setBivacco" && (
        <button onClick={() => handleIndietro()}>INDIETRO</button>
      )}
    </div>
  )
}