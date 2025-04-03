"use client";

import "../../styles/loginregistrati.css";

import React, { useState } from "react";
// import { useNavigate } from "react-router-dom"; // Per il reindirizzamento

// Definizione del tipo di utente ricevuto dal server
interface User {
  nome: string;
  cognome: string;
  mail: string;
}

const Login: React.FC = () => {
  const [isLogged, setIsLogged] = useState<boolean>(false);
  const [nome, setNome] = useState<string>("");
  const [cognome, setCognome] = useState<string>("");
  const [mail, setMail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  // const navigate = useNavigate(); // Hook per la navigazione

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(""); // Reset degli errori

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mail, password }),
      });

      const data: { message: string; user?: User } = await response.json();

      if (response.ok && data.user) {
        setIsLogged(true);
        setNome(data.user.nome); // Recupero il nome dal server
        setCognome(data.user.cognome); // Recupero il cognome dal server
        // navigate("/benvenuto");
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError("Errore nella connessione al server");
    }
  };

  if (!isLogged) {
    return (
      <div className="container">
        <form onSubmit={handleSubmit}>
            <header>
              <h2>ACCEDI:</h2>
              <h4>Inserisci le tue credenziali di accesso.</h4>
            </header>
            {error && <p style={{ color: "red" }}>{error}</p>}
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
            <br/>
            <section>
              <button type="submit">ACCEDI</button>
            </section>

            <footer>
              <h4>Non hai ancora un account? </h4>
                <a href="/registrati" className="hover:underline">
                  REGISTRATI
                </a>
            </footer>
        </form>
      </div>
    );
  } else {
    return (
      <div className="container">
        <h1>Benvenuto {nome} {cognome}</h1>
      </div>
    );
  }
};

export default Login;