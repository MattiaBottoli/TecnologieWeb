"use client";

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
  _id: string;
  mail: string;
  data: string;
  percorso: string;
  bivacco: string;
  fasciaOraria: string;
  numpartecipanti: number; 
  idBivacco: string
  idPercorso: string
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
  const { isLoggedIn, email, loading } = useAuth();
  const [error, setError] = useState<string>("");
  const router = useRouter();
  const [saltaBivacco, setSaltaBivacco] = useState(false);

  const fasceOrarie = [
    "9:00-10:00", "10:00-11:00", "12:00-13:00", 
    "14:00-15:00", "15:00-16:00", "16:00-17:00", 
    "18:00-19:00", "19:00-20:00", "20:00-21:00"
  ];

  const today = new Date().toISOString().split('T')[0];

useEffect(() => {
  if (loading) return;

  if (!isLoggedIn) {
    router.push("/registrati");
    return;
  }

  const fetchData = async () => {
    try {
      const resPercorsi = await fetch("http://localhost:5000/api/percorsi");
      const percorsiData = await resPercorsi.json();
      setPercorsi(percorsiData);
      if (percorsiData.length > 0) setSelectedPercorso(percorsiData[0]._id);

      const resBivacchi = await fetch("http://localhost:5000/api/bivacchi");
      const bivacchiData = await resBivacchi.json();
      setBivacchi(bivacchiData);
    } catch (error) {
      console.error("Errore nel recupero dati:", error);
    }
  };

  fetchData();
}, [isLoggedIn, loading, router]);

  useEffect(() => {
  if (mode === "setBivacco" && selectedBivacco && date) {
    fetchPrenotazioni();
  }
}, [selectedBivacco, date, mode]);
  
  const fetchPrenotazioni = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/prenotazioni?bivaccoId=${selectedBivacco}&data=${date}`);
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

    const nomePercorso = percorsi.find(p => p._id === selectedPercorso);
    const nomeBivacco = bivacchi.find(b => b._id === selectedBivacco);

    try {
      const response = await fetch("http://localhost:5000/api/programmi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mail: email,
          numpartecipanti: partecipanti,
          data: date,
          percorsoId: selectedPercorso,
          bivaccoId: selectedBivacco,
          fasciaOraria: fasciaOraria,
          percorso: nomePercorso ? nomePercorso.nome : "Nessun percorso selezionato",
          bivacco: nomeBivacco ? nomeBivacco.nome : "Nessun bivacco selezionato"
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
    const bivacco = bivacchi.find(b => b._id === selectedBivacco);
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
    <div className="Modifica-Container">
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
              onChange={(e) => {
                const val = e.target.value
                setPartecipanti(val === "" ? 1 : Number(val))
              }}
              min={1}
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
                <option key={percorso._id} value={percorso._id}>
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
              Vi consigliamo i bivacchi che si trovano nella stessa località del percorso selezionato.
            </p>
          </section>
          <br />
          <section>
            <label>BIVACCO</label>
            <select
              value={selectedBivacco}
              onChange={(e) => {
                setSelectedBivacco(e.target.value)
                if (e.target.value!==""){
                  setSaltaBivacco(false)
                }
              }}
            >
              <option value="">SELEZIONA UN BIVACCO</option>
              {bivacchi
                .filter((bivacco) => bivacco.localita === percorsi.find((p) => p._id === selectedPercorso)?.localita)
                .map((bivacco) => (
                  <option key={bivacco._id} value={bivacco._id}>
                    {bivacco.nome}
                  </option>
                ))}
            </select>
          </section>
          {selectedBivacco && (
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
          <section>
            <label>Non voglio prenotare un bivacco
              <input
              type="checkbox"
              checked={saltaBivacco}
              onChange={(e)=>{
                setSaltaBivacco(e.target.checked)
                if (e.target.checked){
                  setSelectedBivacco("");
                  setFasciaOraria("");  
                }
              }}  
              />
            </label>
          </section>
          <footer>
            <button type="submit" disabled={!fasciaOraria && !saltaBivacco}>INVIA</button>
          </footer>
        </form>
      )}
      {mode === "setBivacco" && (
        <button onClick={() => handleIndietro()}>INDIETRO</button>
      )}
    </div>
  )
}
