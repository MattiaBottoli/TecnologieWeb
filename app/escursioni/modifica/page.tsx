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
    bivaccoId: string
    percorsoId: string
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
  const [percorsoPrev, setPercorsoPrev] = useState<string>("");
  const [saltaBivacco, setSaltaBivacco] = useState(false)
  const [nomePercorsoPrev, setNomePercorsoPrev]=useState<string>("")
  const [nomeBivaccoPrev, setNomeBivaccoPrev]=useState<string>("")
  const [nomePercorso, setNomePercorso]=useState<string>("")
  const [nomeBivacco, setNomeBivacco]=useState<string>("")
  
  const fasceOrarie = [
    "9:00-10:00", "10:00-11:00", "12:00-13:00",
    "14:00-15:00", "15:00-16:00", "16:00-17:00",
    "18:00-19:00", "19:00-20:00", "20:00-21:00"
  ];

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {

    if (!isLoggedIn){
      router.push("/login")
      return
    }

    fetch("http://localhost:5000/api/percorsi")
      .then(res => res.json())
      .then(data => {
        setPercorsi(data)
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
          setPartecipanti(data.numpartecipanti)
          setSelectedPercorso(data.percorsoId)
          setPercorsoPrev(data.percorsoId)
          setNomePercorso(data.percorso)
          setNomePercorsoPrev(data.percorso)
          setNomeBivacco(data.bivacco)
          setNomeBivaccoPrev(data.bivacco)
          if (data.bivacco==="Nessun bivacco selezionato" &&
            data.fasciaOraria==="Nessuna fascia oraria selezionata"
          ){
            setSaltaBivacco(true)
            setSelectedBivacco("")
            setBivaccoPrev("")
            setOraPrev("")
            setFasciaOraria("")
          }else{
            setSaltaBivacco(false)
            setSelectedBivacco(data.bivaccoId)
            setBivaccoPrev(data.bivaccoId)
            setOraPrev(data.fasciaOraria)
            setFasciaOraria(data.fasciaOraria)
          }
        })
        .finally(()=>setIsLoading(false))
        .catch((error) => console.error("Errore nel recupero della prenotazione:", error));
      }

    if (mode === "setBivacco" && selectedBivacco && date) {
        fetch(`http://localhost:5000/api/prenotazioni?bivaccoId=${selectedBivacco}&data=${date}`)
          .then(res => res.json())
          .then(data => setPrenotazioni(data));
      }
  }, [ isLoggedIn, selectedBivacco, date, mode]);

  const postiDisponibili = (fascia: string) => {
    const bivacco = bivacchi.find(b => b._id === selectedBivacco);
    if (!bivacco) return 0;
    const prenotati = prenotazioni
      .filter(p => p.fasciaOraria === fascia && p._id !== idPrenotazione)
      .reduce((sum, p) => sum + p.numpartecipanti, 0);
    return bivacco.capienza - prenotati;
  };

  const changeMode = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedPercorso !== percorsoPrev) {
      setSelectedBivacco("")
      setFasciaOraria("")
      setSaltaBivacco(false)
      setNomeBivacco("Nessun bivacco selezionato")
    }
    else{
      if (nomeBivaccoPrev === "Nessun bivacco selezionato" && oraPrev===""){ 
        setSelectedBivacco("")
        setFasciaOraria("")
        setSaltaBivacco(true)
        setNomeBivacco(nomeBivaccoPrev)
      }
      else{
        setSelectedBivacco(bivaccoPrev)
        setNomeBivacco(nomeBivaccoPrev)
        setFasciaOraria(oraPrev)
        setSaltaBivacco(false)
      }
    }
    const percorso = percorsi.find(p => p._id === selectedPercorso)
    setNomePercorso(percorso?.nome || "")
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
        percorso: nomePercorso,
        bivacco: nomeBivacco,
        fasciaOraria: fasciaOraria ? fasciaOraria : "Nessuna fascia oraria selezionata",
        percorsoId: selectedPercorso,
        bivaccoId: selectedBivacco
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
    setSelectedBivacco(bivaccoPrev);
    setNomeBivacco(nomeBivaccoPrev)
    setFasciaOraria(oraPrev);
  }

  return (
    <div className="Modifica-Container">
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
            <input type="number" value={partecipanti} 
            onChange={e => {
              const val = e.target.value
              setPartecipanti(val === "" ? 1 : Number(val))
            }}
            min={1}
            required />
          </section>
          <section>
            <label>Percorso</label>
            <select value={selectedPercorso} onChange={e => setSelectedPercorso(e.target.value)} required>
              {percorsi.map(percorso => (
                <option key={percorso._id} value={percorso._id}>{percorso.nome}</option>
              ))}
            </select>
          </section>
          <button type="submit">AVANTI</button>
        </form>
      ) : (
        <form onSubmit={handleSubmit}>
          <section>
            <label>Bivacco</label>
            <select value={selectedBivacco} onChange={(e) => {
                const nuovoBivacco = e.target.value;
                if (nuovoBivacco !== selectedBivacco) {
                  setFasciaOraria("");
                }
                setSelectedBivacco(nuovoBivacco);
                if (nuovoBivacco !== "") {
                  setSaltaBivacco(false);
                  const bivacco = bivacchi.find(b => b._id === nuovoBivacco);
                  setNomeBivacco(bivacco?.nome || "");
                }else setNomeBivacco("Nessun bivacco selezionato");
              }}>
              <option value="">Seleziona un bivacco</option>
              {bivacchi
                .filter(b => b.localita === percorsi.find(p => p._id === selectedPercorso)?.localita)
                .map(b => (
                  <option key={b._id} value={b._id}>{b.nome}</option>
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
                            disabled={ disponibili < partecipanti }
                            onClick={() => setFasciaOraria(fascia)}
                            style={{ backgroundColor: disponibili < partecipanti ? undefined : fasciaOraria === fascia ? "lightgreen" : undefined }}
                          >
                            {disponibili < partecipanti ? "" : fasciaOraria === fascia ? "Selezionato" : ""}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          )}
          <section>
            <label>Non voglio selezionare un bivacco
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
            <button type="submit" disabled={!fasciaOraria && !saltaBivacco}>MODIFICA</button>
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