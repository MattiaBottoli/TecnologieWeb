// app/bivacchi/[id]/page.tsx
"use client"

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import dynamic from "next/dynamic";
// Importa il componente MiniMappa dinamicamente per il rendering lato client
const MiniMappa = dynamic(() => import("../../../components/MiniMappa"), {
  ssr: false, // Disabilita il Server-Side Rendering per questo componente
});

// Interfaccia per la singola recensione, che ora include l'email dell'utente
interface RecensioneBivacco {
  userEmail: string;
  voto: number;
}

// Interfaccia per i dati del Bivacco, con il campo recensioni aggiornato
interface Bivacco {
  id: string;
  nome: string;
  localita: string;
  sentiero: string;
  altezza: number;
  capienza: number;
  desrizione: string;
  latitudine: number;
  longitudine: number;
  recensioni?: RecensioneBivacco[]; // Ora è un array di oggetti RecensioneBivacco
}

export default function DettaglioBivacco() {
  const { id } = useParams(); // Ottiene l'ID del bivacco dai parametri dell'URL
  const [bivacco, setBivacco] = useState<Bivacco | null>(null); // Stato per i dati del bivacco

  // Effetto per recuperare i dati del bivacco quando l'ID cambia
  useEffect(() => {
    fetch(`http://localhost:5000/api/bivacchi/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Errore nel recupero del bivacco: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => setBivacco(data))
      .catch((err) => console.error("Errore nel caricamento del bivacco:", err));
  }, [id]); // Dipendenza dall'ID per rieseguire il fetch quando cambia

  // Mostra un messaggio di caricamento finché i dati non sono disponibili
  if (!bivacco) return <p>Caricamento...</p>;

  // Calcolo della media dei voti
  // Accede al campo 'voto' di ciascun oggetto nell'array 'recensioni'
  // Aggiunge un filtro per assicurarsi che solo i numeri vengano inclusi nel calcolo
  const votiNumerici = bivacco.recensioni?.map(r => r.voto).filter(v => typeof v === 'number') ?? [];
  const media = votiNumerici.length > 0 ? votiNumerici.reduce((a, b) => a + b, 0) / votiNumerici.length : 0;
  const stellePiene = Math.round(media); // Arrotonda la media per determinare le stelle piene

  return (
    <div className="BivaccoDettaglio-Container">
      <h1>{bivacco.nome}</h1>
      <p><strong>Località:</strong> {bivacco.localita}</p>
      <p><strong>Sentiero:</strong> {bivacco.sentiero}</p>
      <p><strong>Altezza:</strong> {bivacco.altezza}</p>
      <p><strong>Capienza:</strong> {bivacco.capienza}</p>
      <p><strong>Descrizione:</strong> {bivacco.desrizione}</p>
      <p><strong>Coordinate:</strong> {bivacco.latitudine}, {bivacco.longitudine}</p>

      <p><strong>Recensione dei nostri Utenti:</strong></p>
      <div className="recensioni-stars">
        {/* Genera 5 stelle, piene o vuote, basate sulla media */}
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i}>
            {i < stellePiene ? "★" : "☆"}
          </span>
        ))}
        {/* Mostra la media numerica arrotondata a un decimale */}
        <span className="media-voto"> ({media.toFixed(1)})</span>
        {/* Mostra anche il numero totale di recensioni */}
        
      </div>
      

      {/* Componente MiniMappa per visualizzare la posizione del bivacco */}
      <MiniMappa
        posizione={[bivacco.latitudine, bivacco.longitudine]}
        nome={bivacco.nome}
      />
    </div>
  );
}