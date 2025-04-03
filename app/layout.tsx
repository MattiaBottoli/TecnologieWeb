import "../styles/globals.css";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Trentino Explorer",
  description: "Esplora il Trentino con percorsi, bivacchi e avventure.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        {/* Navbar Globale */}
        <header className="header-blocked">
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
          <div className="auth-buttons">
          <Link href="/registrati">
            <button className="contact-btn">REGISTRATI</button>
          </Link>
          
          <Link href="/login">
            <button className="contact-btn">LOGIN</button>
          </Link>
          </div>
        </header>

        {/* Contenuto della pagina */}
        <main>{children}</main>
      </body>
    </html>
  );
}
