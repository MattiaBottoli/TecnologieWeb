"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";

interface Prenotazione {
  _id: string;
  mail: string;
  data: string;
  percorso: string;
  bivacco: string;
}

const Prenotazioni = () => {
  const { isLoggedIn, email} = useAuth();
  const router = useRouter();
  const [prenotazioni, setPrenotazioni] = useState<Prenotazione[]>([]);

  useEffect(() => {
    if (isLoggedIn) {
      fetch("http://localhost:5000/api/prenotazioni",{
        method: "GET",
        headers: {"Content-Type": "application/json" ,
          "user_email": email,
        },
      }
      )
        .then((res) => res.json())
        .then((data) => setPrenotazioni(data))
        .catch((err) => console.error("Errore nel caricamento", err));
    }
    else
      router.push("/"); 
  }, [isLoggedIn, email]);

  return (
    <div className="container">
      <h1>In programma ... </h1>
        {prenotazioni.length === 0 ? (
          <p>Non hai prenotazioni.</p>
        ):(
          <ul>
          {prenotazioni.map((p) => (
            <li key={p._id}>
              <h1><strong>Il {p.data}:</strong></h1>
              <p>{p.bivacco}</p>
            </li>
          ))}
          </ul>
        )}
    </div>
  );
};

export default Prenotazioni;