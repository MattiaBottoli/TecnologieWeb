import Image from "next/image";
import Link from "next/link";

import "../styles/globals.css";

export default function Home() {
  return (
    <main>
      <section className="hero">
        <h1>Benvenuto in Trentino Explorer</h1>
        <p>Immergiti nella bellezza naturale del Trentino. Pianifica la tua avventura con percorsi, bivacchi e esperienze uniche.</p>
        <Link href="/programmazione" passHref> {/* passHref is good practice with custom elements */}
          <button className="explore-btn">PROGRAMMA UN ESCURSIONE →</button>
        </Link>
      </section>

      <section className="features">
        <Link href="/aggiungi" passHref>
          <div className="feature-card">
            <Image src="/trek.png" alt="Paesaggi" width={70} height={70} />
            <p>Aggiungi un'esperienza</p>
          </div>
        </Link>
        <Link href="/bivacchi?view=percorsi" passHref>
          <div className="feature-card">
            <Image src="/trial.png" alt="Percorsi" width={70} height={70} />
            <p>Percorsi per tutti i livelli</p>
          </div>
        </Link>
        <Link href="/bivacchi?view=bivacchi" passHref>
          <div className="feature-card">
            <Image src="/camp.png" alt="Bivacchi" width={70} height={70} />
            <p>Bivacchi e rifugi accoglienti</p>
          </div>
        </Link>
      </section>

<hr />

<div className="container">
  <header>
    <h1>Ritrova te stesso tra le meraviglie del Trentino</h1>
  </header>

  <section>
    <p>
      Hai bisogno di staccare dalla routine quotidiana? 
      <Link href="/programmazione">Pianifica la tua escursione ideale</Link> e immergiti nella natura incontaminata del Trentino. 
      Che tu voglia condividere l'avventura con la tua famiglia, esplorare nuovi sentieri con gli amici o affrontare la montagna in solitaria, 
      troverai l’itinerario perfetto per te.
    </p>
  </section>

  <section>
    <p>
      Non sai da dove iniziare? Nessun problema. Dai un'occhiata alla nostra selezione di <Link href="/bivacchi?view=bivacchi">bivacchi e rifugi</Link>, 
      luoghi magici immersi tra boschi, laghi alpini e cime spettacolari. 
      Perfetti per una pausa rigenerante o per una notte sotto le stelle in alta quota.
    </p>
  </section>

  <section>
    <p>
      Desideri vivere la montagna a 360°? <strong>Diventa parte della nostra community</strong>. 
      Con il tesseramento accedi a contenuti esclusivi: guide approfondite, percorsi segreti, eventi speciali, e la possibilità di lasciare recensioni e foto. 
      <Link href="/profilo">Scopri tutti i vantaggi del tesseramento</Link> e unisciti agli amanti dell'outdoor come te.
    </p>
  </section>

  <footer>
    <p>
      Trentino Explorer è molto più di un semplice sito: è la porta d'accesso al tuo prossimo respiro d’aria pura. <br />
      Zaino in spalla, scarponi ai piedi… l’avventura ti aspetta.
    </p>
  </footer>
</div>

<hr />
      <section className="about">
        <h2>Chi siamo</h2>
        <p>Trentino Explorer è il punto di riferimento per gli amanti della montagna. Scopri itinerari, rifugi e avventure uniche immerse nella natura.</p>
      </section>

      <hr />
      
      <section className="contact">
        <h2>Contattaci</h2>
        <p>Hai domande o suggerimenti? Scrivici e saremo felici di aiutarti!</p>
        <a href="mailto:trentinoexplorer@info.it">
          <button className="contact-btn">Contattaci</button>
        </a>
      </section>

      <hr />

      
    </main>
  );
}