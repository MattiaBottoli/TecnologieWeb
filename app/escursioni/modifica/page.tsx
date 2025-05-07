"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";

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
    numpartecipanti: number;
    fasciaOraria: string;
}

export default function ModificaPrenotazione() {
  const [mode, setMode] = useState("setPercorso");
  const [date, setDate] = useState<string>("");
  const [partecipanti, setPartecipanti] = useState<number>(1);
  const [selectedPercorso, setSelectedPercorso] = useState<string>("");
  const [selectedBivacco, setSelectedBivacco] = useState<string>("");
  const [fasciaOraria, setFasciaOraria] = useState<string>("");
  const [percorsi, setPercorsi] = useState<Percorso[]>([]);
  const [bivacchi, setBivacchi] = useState<Bivacco[]>([]);
  const [prenotazioni, setPrenotazioni] = useState<Prenotazione[]>([]);
  const { isLoggedIn, email } = useAuth();
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const idPrenotazione = searchParams.get("idPrenotazione");
  const [isLoading, setIsLoading] = useState(true);
  const [bivaccoPrev, setBivaccoPrev] =useState<string>("");
  const [oraPrev, setOraPrev] = useState<string>("");

  const fasceOrarie = [
    "9:00-10:00", "10:00-11:00", "12:00-13:00",
    "14:00-15:00", "15:00-16:00", "16:00-17:00",
    "18:00-19:00", "19:00-20:00", "20:00-21:00"
  ];

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!isLoggedIn) router.push("/registrati");

    fetch("http://localhost:5000/api/percorsi")
      .then(res => res.json())
      .then(data => {
        setPercorsi(data);
        if (data.length > 0 && !selectedPercorso) {
            setSelectedPercorso(data[0].nome);
          }
      })
      .catch((error) => console.error("Errore nel recupero dei percorsi:", error));

    fetch("http://localhost:5000/api/bivacchi")
      .then(res => res.json())
      .then(data => setBivacchi(data))
      .catch((error)=> console.error("Errore nel recupero dei bivacchi:",error));
    
    if (idPrenotazione && isLoading) {
      fetch(`http://localhost:5000/api/prenotazioni/${idPrenotazione}`)
        .then(res => res.json())
        .then((data: Prenotazione) => {
          setDate(data.data);
          setPartecipanti(data.numpartecipanti);
          setSelectedPercorso(data.percorso);
          setOraPrev(data.fasciaOraria);
          setBivaccoPrev(data.bivacco);
        })
        .finally(()=>setIsLoading(false))
        .catch((error) => console.error("Errore nel recupero della prenotazione:", error));
      }

    if (mode === "setBivacco" && selectedBivacco && date) {
        fetch(`http://localhost:5000/api/prenotazioni?bivacco=${selectedBivacco}&data=${date}`)
          .then(res => res.json())
          .then(data => setPrenotazioni(data));
      }
  }, [ isLoggedIn, selectedBivacco, date, mode]);

  const postiDisponibili = (fascia: string) => {
    const bivacco = bivacchi.find(b => b.nome === selectedBivacco);
    if (!bivacco) return 0;
    const prenotati = prenotazioni
      .filter(p => p.fasciaOraria === fascia)
      .reduce((sum, p) => sum + p.numpartecipanti, 0);
    return bivacco.capienza - prenotati;
  };

  const changeMode = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMode("setBivacco");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/prenotazioni/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_prenotazione: idPrenotazione,
          numpartecipanti: partecipanti,
          data: date,
          percorso: selectedPercorso,
          bivacco: selectedBivacco,
          fasciaOraria: fasciaOraria
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Prenotazione aggiornata con successo!");
        router.push("/escursioni");
      } else {
        setError(data.message);
      }
    } catch {
      setError("Errore nella connessione al server");
    }
  };

  const handleIndietro = () => {
    setMode("setPercorso");
    setSelectedBivacco("");
    setFasciaOraria("");
  }

  return (
    <div className="container">
      <header><h1>Modifica Prenotazione</h1></header>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {mode === "setPercorso" ? (
        <form onSubmit={changeMode}>
          <section>
            <label>Data</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required min={today} />
          </section>
          <section>
            <label>Numero Partecipanti</label>
            <input type="number" value={partecipanti} onChange={e => setPartecipanti(e.target.valueAsNumber)} required />
          </section>
          <section>
            <label>Percorso</label>
            <select value={selectedPercorso} onChange={e => setSelectedPercorso(e.target.value)} required>
              {percorsi.map(percorso => (
                <option key={percorso._id} value={percorso.nome}>{percorso.nome}</option>
              ))}
            </select>
          </section>
          <button type="submit">AVANTI</button>
        </form>
      ) : (
        <form onSubmit={handleSubmit}>
          <section>
            <label>Bivacco</label>
            <select value={selectedBivacco} onChange={e => setSelectedBivacco(e.target.value)} required>
              <option value="">Seleziona un bivacco</option>
              {bivacchi
                .filter(b => b.localita === percorsi.find(p => p.nome === selectedPercorso)?.localita)
                .map(b => (
                  <option key={b._id} value={b.nome}>{b.nome}</option>
                ))}
            </select>
          </section>

          {selectedBivacco && (
            <section>
              <h2>Fasce Orarie Disponibili</h2>
              <table>
                <thead>
                  <tr><th>Fascia</th><th>Posti</th><th>Seleziona</th></tr>
                </thead>
                <tbody>
                  {fasceOrarie.map(fascia => {
                    const disponibili = postiDisponibili(fascia);
                    return (
                      <tr key={fascia}>
                        <td>{fascia}</td>
                        <td>{disponibili}</td>
                        <td>
                          <button
                            type="button"
                            disabled={disponibili < partecipanti && (oraPrev===fascia && bivaccoPrev===selectedBivacco)}
                            onClick={() => setFasciaOraria(fascia)}
                            style={{ backgroundColor: fasciaOraria === fascia ? "lightgreen" : undefined }}
                          >
                            {(fasciaOraria === fascia && (oraPrev != fascia && bivaccoPrev === selectedBivacco)) ? "Selezionato" : ""}
                            {(fasciaOraria === fascia && bivaccoPrev != selectedBivacco) ? "Selezionato" : ""}
                            {(oraPrev === fascia && bivaccoPrev === selectedBivacco) && "Selezionato precedentemente"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          )}

          <footer>
            <button type="submit" disabled={!fasciaOraria}>MODIFICA</button>
          </footer>
        </form>
      )}
      {mode === "setBivacco" && (
        <button type="button" onClick={() => handleIndietro()}>INDIETRO</button>
      )}
      <button type="button" onClick={()=> router.push("/escursioni")}>ANNULLA</button>
    </div>
  );
}
