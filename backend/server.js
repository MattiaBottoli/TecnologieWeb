// server.js
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const bcrypt = require("bcryptjs");

const app = express();

// Configurazione della connessione a MongoDB
const PORT = 5000;
const MONGO_URI = "mongodb://localhost:27017/TrentinoExplorer"; // Cambia l'URI se il database è su un server remoto
const DB_NAME = "local"; // Nome del database
const COLLECTION_COMPRENSORI = "Comprensori"; // Nome della collezione
const COLLECTION_UTENTI = "Utenti";

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

app.post("/api/register", async (req, res) => {
    const client = new MongoClient(MONGO_URI);
    
    try {
      await client.connect();
      const db = client.db(DB_NAME);
      const collection = db.collection(COLLECTION_UTENTI);
  
      const { nome, cognome, mail, password } = req.body;
  
      // Crittografia della password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newUser = {
        nome,
        cognome,
        mail,
        password: hashedPassword, // Salviamo la password crittografata
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
        return res.status(401).json({ message: "Email o password errata" });
      }
  
      // Verifica della password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Email o password errata" });
      }
  
      res.status(200).json({ message: "Login riuscito!", user: { nome: user.nome, cognome: user.cognome, mail: user.mail } });
  
    } catch (error) {
      res.status(500).json({ message: "Errore interno del server" });
    } finally {
      await client.close();
    }
  });

// Avvio del server
app.listen(PORT, () => {
  console.log(`Server in esecuzione su http://localhost:${PORT}`);
});