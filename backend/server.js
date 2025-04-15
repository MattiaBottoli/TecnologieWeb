// server.js
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId} = require('mongodb');
const bcrypt = require("bcryptjs");

const app = express();

// Configurazione della connessione a MongoDB
const PORT = 5000;
const MONGO_URI = "mongodb://localhost:27017/TrentinoExplorer"; // Cambia l'URI se il database è su un server remoto
const DB_NAME = "local"; // Nome del database
const COLLECTION_COMPRENSORI = "Comprensori";
const COLLECTION_UTENTI = "Utenti";
const COLLECTION_PRENOTAZIONI = "Prenotazioni";
const COLLECTION_BIVACCHI = "Bivacchi";
const COLLECTION_PERCORSI = "Percorsi";


app.use(cors()); // Per evitare problemi di CORS
app.use(express.json()); // Per gestire richieste JSON

app.get('/api/comprensori', async (req, res) => {
 const client = new MongoClient(MONGO_URI);
 try {
     await client.connect();
     const db = client.db(DB_NAME);
     const collection = db.collection(COLLECTION_COMPRENSORI);
     const comprensori = await collection.find().toArray();
     res.json(comprensori); // Risponde con i dati in JSON
 } catch (error) {
     console.error("Errore nel recupero dei dati:", error);
     res.status(500).json({ message: "Errore interno del server" });
 } finally {
     await client.close();
 }
});

app.get("/api/bivacchi", async (req, res) => {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_BIVACCHI);
    const bivacchi = await collection.find().toArray();
    res.json(bivacchi);
  } catch (error) {
    console.error("Errore nel recupero dei bivacchi:", error);
    res.status(500).json({ message: "Errore interno del server" });
  } finally {
    await client.close();
  }
});

app.get("/api/percorsi", async (req, res) => {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_PERCORSI);
    const percorsi = await collection.find().toArray();
    res.json(percorsi);
  } catch (error) {
    console.error("Errore nel recupero dei percorsi:", error);
    res.status(500).json({ message: "Errore interno del server" });
  } finally {
    await client.close();
  }
});

app.post("/api/register", async (req, res) => {
    const client = new MongoClient(MONGO_URI);
    try {
      await client.connect();
      const db = client.db(DB_NAME);
      const collection = db.collection(COLLECTION_UTENTI);
  
      const { nome, cognome, mail, password, tesserato,preferiti = [] } = req.body;

      const user = await collection.findOne({ mail });
      if (user) {
        return res.status(401).json({ message: "Hai già creato un account con questa mail!"});
      }
      // Crittografia della password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newUser = {
        nome,
        cognome,
        mail,
        password: hashedPassword, // Salviamo la password crittografata
        tesserato,
        preferiti,
        prenotatiDaAltri: []
      };

      const result = await collection.insertOne(newUser);
      res.status(201).json({ message: "Utente registrato con successo!", id: result.insertedId });

    } catch (error) {
      console.error("Errore nella registrazione:", error);
      res.status(500).json({ message: "Errore interno del server" });
    } finally {
      await client.close();
    }
  });

  app.post("/api/login", async (req, res) => {
    const client = new MongoClient(MONGO_URI);
    try {
      await client.connect();
      const db = client.db(DB_NAME);
      const collection = db.collection(COLLECTION_UTENTI);
  
      const { mail, password } = req.body;
  
      // Controllo se l'utente esiste
      const user = await collection.findOne({ mail });
      if (!user) {
        return res.status(401).json({ message: "Email o password errata!" });
      }
  
      // Verifica della password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Email o password errata!" });
      }
  
      res.status(200).json({
        message: "Login riuscito!",
        user: {
          nome: user.nome,
          cognome: user.cognome,
          mail: user.mail,
          tesserato: user.tesserato || false,
          preferiti: Array.isArray(user.preferiti) ? user.preferiti : [],
          prenotatiDaAltri: Array.isArray(user.prenotatiDaAltri) ? user.prenotatiDaAltri : []
        }
      });
  
    } catch (error) {
      res.status(500).json({ message: "Errore interno del server" });
    } finally {
      await client.close();
    }
  });

  app.get("/api/prenotazioni", async (req, res) => {
    const client = new MongoClient(MONGO_URI);
    try {
      await client.connect();
      const db = client.db(DB_NAME);
      const collection = db.collection(COLLECTION_PRENOTAZIONI);
      const mail=req.headers["user_email"];
      const prenotazioni = await collection.find({mail}).toArray();
      res.json(prenotazioni);
    } catch (error) {
      console.error("Errore nel recupero delle prenotazioni:", error);
      res.status(500).json({ message: "Errore interno del server", prenotazioni: [] });
    } finally {
      await client.close();
    }
  });

  app.post("/api/programmi", async (req, res) => {
    const client = new MongoClient(MONGO_URI);
    try {
      await client.connect();
      const db = client.db(DB_NAME);
      const collection = db.collection(COLLECTION_PRENOTAZIONI);
  
      const { mail, data, percorso, bivacco } = req.body;
  
      const newProgramma = {
        mail,
        data,
        percorso,
        bivacco,
      };

      const result = await collection.insertOne(newProgramma);
      res.status(201).json({ message: "Nuova escursione registrata con successo!", id: result.insertedId });

    } catch (error) {
      console.error("Errore nella programmazione:", error);
      res.status(500).json({ message: "Errore interno del server" });
    } finally {
      await client.close();
    }
  });

  app.get("/api/utente/:mail", async (req, res) => {
    const client = new MongoClient(MONGO_URI);
    try {
      await client.connect();
      const db = client.db(DB_NAME);
      const collection = db.collection(COLLECTION_UTENTI);
  
      const mail = req.params.mail;
      const user = await collection.findOne({ mail });
  
      if (!user) {
        return res.status(404).json({ message: "Utente non trovato" });
      }
  
      // Rimuoviamo la password per sicurezza
      delete user.password;
  
      res.status(200).json({user: {
        nome: user.nome,
        cognome: user.cognome,
        mail: user.mail,
        tesserato: user.tesserato || false,
        preferiti: Array.isArray(user.preferiti) ? user.preferiti : [],
        prenotatiDaAltri: Array.isArray(user.prenotatiDaAltri) ? user.prenotatiDaAltri : []
      } });
  
    } catch (error) {
      console.error("Errore nel recupero utente:", error);
      res.status(500).json({ message: "Errore interno del server" });
    } finally {
      await client.close();
    }
  });

  app.post("/api/tesseramento", async (req, res) => {
    const client = new MongoClient(MONGO_URI);
    try {
      await client.connect();
      const db = client.db(DB_NAME);
      const collection = db.collection(COLLECTION_UTENTI);
  
      const { mail } = req.body;
  
      // Controlla se l'utente esiste e non è già tesserato
      const user = await collection.findOne({ mail });
      if (!user) {
        return res.status(404).json({ message: "Utente non trovato." });
      }
      if (user.tesserato) {
        return res.status(400).json({ message: "Utente già tesserato." });
      }
  
      // Aggiorna lo stato di tesseramento
      const result = await collection.updateOne(
        { mail },
        { $set: { tesserato: true } }
      );
  
      if (result.modifiedCount === 0) {
        return res.status(500).json({ message: "Errore durante l'aggiornamento dello stato di tesseramento." });
      }
  
      res.status(200).json({ message: "Tesseramento completato con successo!" });
    } catch (error) {
      console.error("Errore nel tesseramento:", error);
      res.status(500).json({ message: "Errore interno del server" });
    } finally {
      await client.close();
    }
  });
  

// Avvio del server
app.listen(PORT, () => {
  console.log(`Server in esecuzione su http://localhost:${PORT}`);
});