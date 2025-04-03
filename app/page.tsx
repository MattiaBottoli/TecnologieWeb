import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <section className="hero">
        <h1>Benvenuto in Trentino Explorer</h1>
        <p>Immergiti nella bellezza naturale del Trentino. Pianifica la tua avventura con percorsi, bivacchi e esperienze uniche.</p>
        <button className="explore-btn">Esplora il Trentino →</button>
      </section>
      
      {/* Features Section */}
      <section className="features">
        <Link href="/paesaggi">
        <button className="contact-btn">
        <div className="feature">
          <Image src="/trek.png" alt="Paesaggi" width={50} height={50} />
          <p>Paesaggi mozzafiato</p>
        </div>
        </button>
        </Link>
        <Link href="/percorsi">
        <button className="contact-btn">
        <div className="feature">
          <Image src="/trial.png" alt="Percorsi" width={50} height={50} />
          <p>Percorsi per tutti i livelli</p>
        </div>
        </button>
        </Link>
        <Link href="/bivacchi">
        <button className="contact-btn">
        <div className="feature">
          <Image src="/camp.png" alt="Bivacchi" width={50} height={50} />
          <p>Bivacchi e rifugi accoglienti</p>
        </div>
        </button>
        </Link>
      </section>
      
      <hr />
      
      {/* About Section */}
      <section className="about">
        <h2>Chi siamo</h2>
        <p>Trentino Explorer è il punto di riferimento per gli amanti della montagna. Scopri itinerari, rifugi e avventure uniche immerse nella natura.</p>
      </section>
      
      <hr />
      
      {/* Contact Section */}
      <section className="contact">
        <h2>Contattaci</h2>
        <p>Hai domande o suggerimenti? Scrivici e saremo felici di aiutarti!</p>
        <button className="contact-btn">Contattaci</button>
      </section>
      
      <hr />
      
      {/* Footer */}
      <footer className="footer">
        <p>© 2025 Trentino Explorer. Tutti i diritti riservati.</p>
      </footer>
    </main>
  );
}
