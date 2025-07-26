"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext"; 

const Login: React.FC = () => {
  const [mail, setMail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const router = useRouter();
  const { login } = useAuth(); 

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mail, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        login(data.token); 
        router.push("/");
      } else {
        setError(data.message || "Credenziali non valide");
        setMail("");
        setPassword("");
      }
    } catch (error) {
      console.error(error);
      setError("Errore nella connessione al server");
    }
  };

  return (
    <div className="Login-Container">
      <form onSubmit={handleSubmit}>
        <fieldset>
          <header>
            <h1>ACCEDI</h1>
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
          <br />
          <section>
            <button type="submit" className="btnlog">ACCEDI</button>
          </section>
        </fieldset>
      </form>
    </div>
  );
};

export default Login;
