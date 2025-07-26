// app/bivacchi/[id]/page.tsx
"use client"

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import dynamic from "next/dynamic";
const MiniMappa = dynamic(() => import("../../../components/MiniMappa"), {
  ssr: false,
});

interface RecensioneBivacco {
  userEmail: string;
  voto: number;
}

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
  recensioni?: RecensioneBivacco[]; 
}

export default function DettaglioBivacco() {
  const { id } = useParams(); 
  const [bivacco, setBivacco] = useState<Bivacco | null>(null); 

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
  }, [id]); 

  if (!bivacco) return <p>Caricamento...</p>;

  const votiNumerici = bivacco.recensioni?.map(r => r.voto).filter(v => typeof v === 'number') ?? [];
  const media = votiNumerici.length > 0 ? votiNumerici.reduce((a, b) => a + b, 0) / votiNumerici.length : 0;
  const stellePiene = Math.round(media); 

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
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i}>
            {i < stellePiene ? "★" : "☆"}
          </span>
        ))}
        <span className="media-voto"> ({media.toFixed(1)})</span>
        
      </div>
      
      <MiniMappa
        posizione={[bivacco.latitudine, bivacco.longitudine]}
        nome={bivacco.nome}
      />
    </div>
  );
}