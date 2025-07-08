import "../styles/globals.css";
import { AuthProvider, useAuth } from "../context/AuthContext";
import Navbar from "../app/navbar";

export const metadata = {
  title: "Trentino Explorer",
  description: "Esplora il Trentino con percorsi, bivacchi e avventure.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <html lang="it">
        <body>
          <Navbar />
          <main>{children}</main>
        
        <footer className="footer">
          <p>© 2025 Trentino Explorer. Tutti i diritti riservati.</p>
        </footer>
        </body>
      </html>
    </AuthProvider>
  );
}
