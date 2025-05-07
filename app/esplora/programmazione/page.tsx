"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import "../../../styles/loginregistrati.css";

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
  const searchParams = useSearchParams();
  const idPrenotazioneToEdit = searchParams.get("idPrenotazione");

  const fasceOrarie = [
    "9:00-10:00", "10:00-11:00", "12:00-13:00", 
    "14:00-15:00", "15:00-16:00", "16:00-17:00", 
    "18:00-19:00", "19:00-20:00", "20:00-21:00"
  ];

  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState<string>(today);

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
      });

    fetch("http://localhost:5000/api/bivacchi")
      .then((res) => res.json())
      .then((data) => setBivacchi(data));
  }, [isLoggedIn, router]);

  useEffect(() => {
    if (idPrenotazioneToEdit) {
      fetch(`http://localhost:5000/api/prenotazioni/?${idPrenotazioneToEdit}`)
        .then(res => res.json())
        .then((data: Prenotazione) => {
          setDate(data.data);
          setPartecipanti(data.numpartecipanti);
          setSelectedPercorso(data.percorso);
          setSelectedBivacco(data.bivacco);
          setFasciaOraria(data.fasciaOraria);
        });
    }
  }, [idPrenotazioneToEdit]);

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

  const changeMode = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMode("setBivacco");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const method = idPrenotazioneToEdit ? "PUT" : "POST";
      const endpoint = idPrenotazioneToEdit 
        ? "http://localhost:5000/api/prenotazioni/update"
        : "http://localhost:5000/api/programmi";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(idPrenotazioneToEdit && { id_prenotazione: idPrenotazioneToEdit }),
          mail: email,
          numpartecipanti: partecipanti,
          data: date,
          percorso: selectedPercorso,
          bivacco: selectedBivacco,
          fasciaOraria: fasciaOraria
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(idPrenotazioneToEdit ? "Prenotazione aggiornata!" : "Prenotazione effettuata!");
        router.push("/prenotazioni");
      } else {
        setError(data.message);
      }
    } catch {
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
  };

  return (
    <div className="container">
      <header>
        <h1>{idPrenotazioneToEdit ? "Modifica Prenotazione" : "Programma un'Escursione"}</h1>
      </header>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {mode === "setPercorso" ? (
        <form onSubmit={changeMode}>
          <section>
            <label>Data</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required min={today} />
          </section>
          <br />
          <section>
            <label>Numero Partecipanti</label>
            <input type="number" value={partecipanti} onChange={(e) => setPartecipanti(e.target.valueAsNumber)} required />
          </section>
          <br/>
          <section>
            <label>Percorso</label>
            <select value={selectedPercorso} onChange={(e) => setSelectedPercorso(e.target.value)} required>
              {percorsi.map((percorso) => (
                <option key={percorso._id} value={percorso.nome}>{percorso.nome}</option>
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
            <label>BIVACCO</label>
            <select
              value={selectedBivacco}
              onChange={(e) => setSelectedBivacco(e.target.value)}
              required
            >
              <option value="">SELEZIONA UN BIVACCO</option>
              {bivacchi
                .filter(b => b.localita === percorsi.find(p => p.nome === selectedPercorso)?.localita)
                .map(b => (
                  <option key={b._id} value={b.nome}>{b.nome}</option>
                ))}
            </select>
          </section>

          {selectedBivacco !== "" && (
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
                            {fasciaOraria === fascia ? "Selezionato" : "Seleziona"}
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
            <button type="button" onClick={handleIndietro}>INDIETRO</button>
          </footer>
        </form>
      )}
    </div>
  );
}