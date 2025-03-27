"use client";

import React, { useState } from "react";

interface UserData {
  nome: string;
  cognome: string;
  mail: string;
  password: string;
}

const Registrati: React.FC = () => {
  const [nome, setNome] = useState<string>("");
  const [cognome, setCognome] = useState<string>("");
  const [mail, setMail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Evita il refresh della pagina

    const userData: UserData = { nome, cognome, mail, password };

    try {
      const response: Response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        alert("Registrazione avvenuta con successo!");
        setNome("");
        setCognome("");
        setMail("");
        setPassword(""); // Pulisce i campi
      } else {
        alert("Errore nella registrazione.");
      }
    } catch (error) {
      console.error("Errore:", error);
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <fieldset>
          <header>
            <h1>REGISTRATI</h1>
            <h4> Inserisci i dati richiesti:</h4>
          </header>

          <section>
            <label>NOME</label>
            <br />
            <input
              type="text"
              placeholder="Inserisci nome..."
              onChange={(e) => setNome(e.target.value)}
              value={nome}
              required
            />
          </section>
          <br />
          <section>
            <label>COGNOME</label>
            <br />
            <input
              type="text"
              placeholder="Inserisci cognome..."
              onChange={(e) => setCognome(e.target.value)}
              value={cognome}
              required
            />
          </section>
          <br />
          <section>
            <label>E-MAIL</label>
            <br />
            <input
              type="email"
              placeholder="Inserisci e-mail..."
              onChange={(e) => setMail(e.target.value)}
              value={mail}
              required
            />
          </section>
          <br />
          <section>
            <label>PASSWORD</label>
            <br />
            <input
              type="password"
              placeholder="Inserisci password..."
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
            />
          </section>

          <footer>
            <button type="submit">CREA</button>
          </footer>
        </fieldset>
      </form>
    </div>
  );
};

export default Registrati;