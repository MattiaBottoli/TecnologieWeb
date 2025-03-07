import React from "react";

const Home = () => {
  return (
    <div className="container">
      <header>
        <h1>Benvenuto su <span>[Nome del Sito]</span> – Il portale per gli amanti della montagna in Trentino</h1>
        <p>
          Sei un appassionato di montagna? Ami esplorare i sentieri estivi, avventurarti sugli sci o scoprire paesaggi mozzafiato? 
          <strong>[Nome del Sito]</strong> è il portale che fa per te! Qui troverai tutto ciò di cui hai bisogno per vivere al meglio la montagna in ogni stagione: 
          <strong> mappe interattive, percorsi dettagliati, condizioni meteo aggiornate, prenotazioni di bivacchi e tanto altro.</strong>
        </p>
      </header>

      <section>
        <h2>🌞 Estate: Trekking, MTB e Avventura</h2>
        <p>Scopri i migliori <strong>percorsi escursionistici e in mountain bike</strong> del Trentino!</p>
        <ul>
          <li>✅ <strong>Sentieri dettagliati</strong> con descrizioni, foto e recensioni</li>
          <li>✅ <strong>Prenota un bivacco</strong> direttamente dal sito</li>
          <li>✅ <strong>Segnala condizioni dei sentieri</strong> per aiutare altri escursionisti</li>
          <li>✅ <strong>Punti di interesse</strong>: rifugi, laghi alpini, cascate e molto altro</li>
        </ul>
        <h3>🌄 Esempi di percorsi estivi</h3>
        <ul>
          <li>🥾 <strong>Giro delle Tre Cime del Bondone</strong> – Escursione panoramica con vista spettacolare</li>
          <li>🚴‍♂️ <strong>Dolomiti di Brenta in MTB</strong> – Un’esperienza unica per gli amanti delle due ruote</li>
        </ul>
      </section>

      <section>
        <h2>❄️ Inverno: Sci, Ciaspole e Sicurezza in Montagna</h2>
        <p>D’inverno, il Trentino si trasforma in un paradiso per gli sciatori e gli amanti della neve.</p>
        <ul>
          <li>✅ <strong>Mappa delle piste da sci e degli impianti aperti</strong></li>
          <li>✅ <strong>Percorsi scialpinistici e ciaspolate</strong> con dettagli su difficoltà e sicurezza</li>
          <li>✅ <strong>Condizioni neve aggiornate</strong> e <strong>bollettino valanghe</strong></li>
          <li>✅ <strong>Prenota un bivacco invernale</strong> per un’esperienza unica nella neve</li>
        </ul>
        <h3>❄️ Esempi di percorsi invernali</h3>
        <ul>
          <li>🎿 <strong>Madonna di Campiglio – Piste Dolomiti Superski</strong></li>
          <li>❄️ <strong>Ciaspolata a Malga Ritorto</strong> – Un percorso magico tra i boschi innevati</li>
        </ul>
      </section>

      <section>
        <h2>🌦 Meteo in Tempo Reale e Sicurezza</h2>
        <p>Il meteo in montagna cambia rapidamente. Qui trovi sempre aggiornate le <strong>condizioni meteo in tempo reale</strong> per il Trentino.</p>
        <ul>
          <li>✅ <strong>Previsioni per oggi e i prossimi giorni</strong></li>
          <li>✅ <strong>Temperatura, vento e rischio valanghe</strong></li>
          <li>✅ <strong>Segnalazioni di allerta</strong> e condizioni dei sentieri/piste</li>
        </ul>
        <p>🔗 Dati forniti da: OpenWeatherMap, MeteoTrentino e fonti locali affidabili.</p>
      </section>

      <section>
        <h2>📌 Funzionalità Esclusive</h2>
        <ul>
          <li>🎯 <strong>Mappa interattiva</strong> con Leaflet e GeoJSON</li>
          <li>🛑 <strong>Segnalazioni utenti</strong> su sentieri e condizioni neve</li>
          <li>🛏 <strong>Prenotazione bivacchi</strong> online</li>
          <li>📢 <strong>Notifiche in tempo reale</strong> su meteo e allerta valanghe</li>
        </ul>
        <p>Il nostro portale è pensato per essere intuitivo, veloce e sempre aggiornato, grazie all’integrazione di tecnologie moderne come <strong>MongoDB, Node.js, React e API RESTful</strong>.</p>
      </section>

      <footer>
        <p>💚 <strong>Esplora il Trentino, scopri la montagna e vivi la natura in ogni stagione!</strong></p>
        <p>👉 <strong>Inizia subito:</strong> scegli la tua avventura tra <strong>Estate</strong>, <strong>Inverno</strong> e <strong>Meteo</strong>!</p>
      </footer>
    </div>
  );
};

export default Home;