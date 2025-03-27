import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main>
      <header className="header">
        <div className="logo">
          <Image src="/logo.png" alt="Logo" width={50} height={50} />
        </div>
        <nav>
          <ul>
            <li><Link href="/">Homepage</Link></li>
            <li><Link href="/percorsi">Percorsi e Avventure</Link></li>
            <li><Link href="/bivacchi">Bivacchi e Rifugi</Link></li>
          </ul>
        </nav>
        <button className="contact-btn">REGISTRATI</button>
        <a href="/login">login</a>
      </header>

      <section className="hero">
        <h1>Benvenuto in Trentino Explorer</h1>
        <p>Immergiti nella bellezza naturale del Trentino. Pianifica la tua avventura con percorsi, bivacchi e esperienze uniche.</p>
        <button className="explore-btn">Esplora il Trentino →</button>
      </section>

      <section className="features">
        <div className="feature">
          <Image src="/icon1.png" alt="Paesaggi" width={50} height={50} />
          <p>Paesaggi mozzafiato</p>
        </div>
        <div className="feature">
          <Image src="/icon2.png" alt="Percorsi" width={50} height={50} />
          <p>Percorsi per tutti i livelli</p>
        </div>
        <div className="feature">
          <Image src="/icon3.png" alt="Bivacchi" width={50} height={50} />
          <p>Bivacchi e rifugi accoglienti</p>
        </div>
      </section>
    </main>
  );
}
