// app/bivacchi/[id]/page.tsx
"use client"

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import dynamic from "next/dynamic";
const MiniMappa = dynamic(() => import("../../../components/MiniMappa"), {
  ssr: false,
});


interface Bivacco {
  id: string;
  nome: string;
  localita: string;
  sentiero: string;
  altezza: number;
  capienza: number;
  descrizione: string;
  latitudine: number;
  longitudine: number;
  votazioni?: number[];
}

export default function DettaglioBivacco() {
  const { id } = useParams();
  const [bivacco, setBivacco] = useState<Bivacco | null>(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/bivacchi/${id}`)
      .then((res) => res.json())
      .then((data) => setBivacco(data))
      .catch((err) => console.error(err));
  }, [id]);



  if (!bivacco) return <p>Caricamento...</p>;

  const voti = bivacco.votazioni ?? [];
  const media = voti.length > 0 ? voti.reduce((a, b) => a + b, 0) / voti.length : 0;
  const stellePiene = Math.round(media);

  return (


    <div className="BivaccoDettaglio-Container">
      <h1>{bivacco.nome}</h1>
      <p><strong>Località:</strong> {bivacco.localita}</p>
      <p><strong>Sentiero:</strong> {bivacco.sentiero}</p>
      <p><strong>Altezza:</strong> {bivacco.altezza}</p>
      <p><strong>Capienza:</strong> {bivacco.capienza}</p>
      <p><strong>Descrizione:</strong> {bivacco.descrizione}</p>
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