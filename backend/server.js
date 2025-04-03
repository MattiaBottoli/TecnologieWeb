const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

const app = express();

// Configurazione della connessione a MongoDB
const PORT = 5000;
const MONGO_URI = "mongodb://localhost:27017/TrentinoExplorer"; // Cambia se necessario
const DB_NAME = "local"; // Nome del database
const COLLECTION_COMPRENSORI = "Comprensori";
const COLLECTION_UTENTI = "Utenti";
const COLLECTION_BIVACCHI = "bivacchi"; // Nuova collezione per i bivacchi

app.use(cors());
app.use(express.json());

// Recupera i comprensori
app.get("/api/comprensori", async (req, res) => {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_COMPRENSORI);
    const comprensori = await collection.find().toArray();
    res.json(comprensori);
  } catch (error) {
    console.error("Errore nel recupero dei dati:", error);
    res.status(500).json({ message: "Errore interno del server" });
  } finally {
    await client.close();
  }
});

// Recupera tutti i bivacchi
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

// Registrazione utente
app.post("/api/register", async (req, res) => {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_UTENTI);

    const { nome, cognome, mail, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      nome,
      cognome,
      mail,
      password: hashedPassword,
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

// Login utente
app.post("/api/login", async (req, res) => {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_UTENTI);

    const { mail, password } = req.body;
    const user = await collection.findOne({ mail });

    if (!user) {
      return res.status(401).json({ message: "Email o password errata" });
    }

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
