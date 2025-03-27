import "../styles/globals.css";

export const metadata = {
  title: "Trentino Explorer",
  description: "Esplora il Trentino con percorsi, bivacchi e avventure.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
