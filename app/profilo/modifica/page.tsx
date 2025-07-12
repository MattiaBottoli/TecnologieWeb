"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";

interface User {
  _id: string;
  nome: string;
  cognome: string;
  username: string;
  mail: string;
}

export default function ModificaProfilo() {
  const [nome, setNome] = useState<string>("");
  const [cognome, setCognome] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [originalMail, setOriginalMail] = useState<string>("");
  const [mail, setMail] = useState<string>("");
  const [error, setError] = useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const idUtente = searchParams.get("idUtente");
  const { logout, isLoggedIn, loading} = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {

    if (loading) return;

    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    if (!idUtente) {
      setError("ID utente mancante");
      return;
    }

    fetch(`http://localhost:5000/api/profilo/${idUtente}`)
      .then(res => {
        if (!res.ok) throw new Error("Errore nel recupero del profilo");
        return res.json();
      })
      .then((data: User) => {
        setNome(data.nome);
        setCognome(data.cognome);
        setUsername(data.username);
        setMail(data.mail);
        setOriginalMail(data.mail)
      })
      .catch((error) => {
        console.error("Errore nel recupero del profilo:", error);
        setError("Errore nel recupero del profilo");
      })
      .finally(() => setIsLoading(false));
  }, [idUtente, isLoggedIn, router, loading]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/profilo/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idUtente: idUtente,
          nome: nome,
          cognome: cognome,
          username: username,
          mail: mail
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Profilo aggiornato con successo!");
        if (originalMail !== mail) {
            logout()
        } else router.push("/profilo");
      } else {
        setError(data.message);
      }
    } catch {
      setError("Errore nella connessione al server");
    }
  };

  if (isLoading) {
    return <p>Caricamento...</p>;
  }

  return (
    <div className="ModificaProfilo-container">
      <header><h1>Modifica Profilo</h1></header>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <section>
          <label>Nome</label>
          <input
            type="text"
            value={nome}
            onChange={e => setNome(e.target.value)}
            required
          />
        </section>

        <section>
          <label>Cognome</label>
          <input
            type="text"
            value={cognome}
            onChange={e => setCognome(e.target.value)}
            required
          />
        </section>

        <section>
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </section>

        <section>
          <label>Email</label>
          <input
            type="email"
            value={mail}
            onChange={e => setMail(e.target.value)}
            required
          />
        </section>

        <footer>
          <button type="submit">MODIFICA</button>
        </footer>
      </form>

      <button type="button" onClick={() => router.push("/profilo")}>ANNULLA</button>
    </div>
  );
}