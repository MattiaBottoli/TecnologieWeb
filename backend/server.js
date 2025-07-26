// server.js
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId} = require('mongodb');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

const PORT = 5000;
const MONGO_URI = "mongodb://localhost:27017/TrentinoExplorer";
const DB_NAME = "local";
const COLLECTION_UTENTI = "Utenti";
const COLLECTION_PRENOTAZIONI = "Prenotazioni";
const COLLECTION_BIVACCHI = "Bivacchi";
const COLLECTION_PERCORSI = "Percorsi";
const today = new Date().toISOString().split('T')[0];
const JWT_SECRET = "supersegreta123";
const TOKEN_EXPIRES_IN = "30m";

app.use(cors()); 
app.use(express.json()); 

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
  
      const { nome, cognome, username, mail, password, tesserato, preferiti = [] } = req.body;

      const user = await collection.findOne({ mail });
      if (user) {
        return res.status(401).json({ message: "Hai già creato un account con questa mail!"});
      }
      const nickname = await collection.findOne({ username });
      if (nickname) {
        return res.status(401).json({ message: "Username non valido!"});
      }

      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newUser = {
        nome,
        cognome,
        username,
        mail,
        password: hashedPassword,
        tesserato,
        preferiti
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

      const user = await collection.findOne({ mail });
      if (!user) {
        return res.status(401).json({ message: "Email o password errata!" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Email o password errata!" });
      }

      const token = jwt.sign(
        {
          mail: user.mail,
          tesserato: user.tesserato
        },
        JWT_SECRET,
        { expiresIn: TOKEN_EXPIRES_IN }
      );

      res.status(200).json({
        message: "Login riuscito!",
        token, 
        user: {
          nome: user.nome,
          cognome: user.cognome,
          mail: user.mail,
          tesserato: user.tesserato || false,
          preferiti: Array.isArray(user.preferiti) ? user.preferiti : [],
        }
      });

    } catch (error) {
      res.status(500).json({ message: "Errore interno del server" });
    } finally {
      await client.close();
    }
  });

  app.delete("/api/profilo/delete", async(req, res)=>{
      const client = new MongoClient(MONGO_URI);
    try {
      await client.connect();
      const db = client.db(DB_NAME);
      const collection = db.collection(COLLECTION_UTENTI);

      const id = req.headers["id_prenotazione"];

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "ID non valido" });
      }
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
  
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Utente non trovato" });
      }
  
      res.json({ message: "Utente eliminato con successo" });
  
    } catch (error) {
      console.error("Errore nella cancellazione:", error);
      res.status(500).json({ message: "Errore interno del server" });
    } finally {
      await client.close();
    }
  });

  app.get("/api/profilo/:id", async(req,res) => {
    const client = new MongoClient(MONGO_URI);
    try {
      await client.connect();
      const db = client.db(DB_NAME);
      const collection = db.collection(COLLECTION_UTENTI);
  
      const idUtente  = req.params.id;
  
      const utente = await collection.findOne({ _id: new ObjectId(idUtente) });
  
      if (!utente) {
        return res.status(404).json({ message: "Utente non trovato" });
      }
  
      res.json(utente);
    } catch (error) {
      console.error("Errore nel recupero della prenotazione:", error);
      res.status(500).json({ message: "Errore interno del server" });
    } finally {
      await client.close();
    }
  })

  app.put("/api/profilo/update", async (req, res) => {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_UTENTI);

    const { idUtente, nome, cognome, username, mail } = req.body;

    if (!ObjectId.isValid(idUtente)) {
      return res.status(400).json({ message: "ID utente non valido" });
    }

    const emailEsistente = await collection.findOne({
      mail: mail,
      _id: { $ne: new ObjectId(idUtente) }
    });

    if (emailEsistente) {
      return res.status(400).json({ message: "Email non valida." });
    }

    const usernameEsistente = await collection.findOne({
      username: username,
      _id: { $ne: new ObjectId(idUtente) }
    });

    if (usernameEsistente) {
      return res.status(400).json({ message: "Username non valido." });
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(idUtente) },
      { $set: { nome, cognome, username, mail} }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Utente non trovato" });
    }

    res.json({ message: "Profilo aggiornato con successo" });
  } catch (error) {
    console.error("Errore nell'aggiornamento del profilo:", error);
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
  
      const { bivaccoId, data } = req.query;
  
      if (bivaccoId && data) {
        const prenotazioni = await collection.find({ bivaccoId, data }).toArray();
        return res.json(prenotazioni);
      }
  
      const mail = req.headers["user_email"];
      if (mail) {
        const prenotazioni = await collection.find({ 
          mail,
          data: { $gte: today } 
        }).toArray();
        return res.json(prenotazioni);
      }
  
      res.status(400).json({ message: "Parametri mancanti: specifica bivacco e data o user_email" });
  
    } catch (error) {
      console.error("Errore nel recupero delle prenotazioni:", error);
      res.status(500).json({ message: "Errore interno del server", prenotazioni: [] });
    } finally {
      await client.close();
    }
  });

  app.get("/api/prenotazioni/:id", async (req, res) => {
    const client = new MongoClient(MONGO_URI);
    try {
      await client.connect();
      const db = client.db(DB_NAME);
      const collection = db.collection(COLLECTION_PRENOTAZIONI);
  
      const idPrenotazione  = req.params.id;
  
      const prenotazione = await collection.findOne({ _id: new ObjectId(idPrenotazione) });
  
      if (!prenotazione) {
        return res.status(404).json({ message: "Prenotazione non trovata" });
      }
  
      res.json(prenotazione);
    } catch (error) {
      console.error("Errore nel recupero della prenotazione:", error);
      res.status(500).json({ message: "Errore interno del server" });
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

    const {
      mail,
      numpartecipanti,
      data,
      percorsoId,
      bivaccoId,
      fasciaOraria,
      percorso,
      bivacco, 
    } = req.body;

    let fasciaOrariaSelezionata = fasciaOraria;
    let bivaccoIdSelezionato = bivaccoId;

    if (!fasciaOraria) {
      fasciaOrariaSelezionata = "Nessuna fascia oraria selezionata";
      bivaccoIdSelezionato = null;
    }

    const newProgramma = {
      mail,
      numpartecipanti,
      data,
      percorso,
      bivacco,
      fasciaOraria: fasciaOrariaSelezionata,
      percorsoId,
      bivaccoId: bivaccoIdSelezionato
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


  app.put("/api/prenotazioni/update", async (req, res) => {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_PRENOTAZIONI);

    const {
      id_prenotazione,
      numpartecipanti,
      data,
      percorso,
      bivacco,
      fasciaOraria,
      percorsoId,
      bivaccoId
    } = req.body;

    let bivaccoSelezionato = bivacco;
    let fasciaOrariaSelezionata = fasciaOraria;

    if (!bivacco && !fasciaOraria) {
      bivaccoSelezionato = "Nessun bivacco selezionato";
      fasciaOrariaSelezionata = "Nessuna fascia oraria selezionata";
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(id_prenotazione) },
      {
        $set: {
          data: data,
          numpartecipanti: numpartecipanti,
          percorso: percorso,
          bivacco: bivaccoSelezionato,
          fasciaOraria: fasciaOrariaSelezionata,
          percorsoId: percorsoId ? percorsoId: null,
          bivaccoId: bivaccoId ? bivaccoId : null,
        },
      }
    );

    if (result.matchedCount === 1) {
      res.json({ message: "Prenotazione aggiornata con successo" });
    } else {
      res.status(404).json({ message: "Prenotazione non trovata!" });
    }
  } catch (error) {
    console.error("Errore nella modifica:", error);
    res.status(500).json({ message: "Errore interno del server" });
  } finally {
    await client.close();
  }
});


  app.delete("/api/prenotazioni/delete", async (req, res) => {
    const client = new MongoClient(MONGO_URI);
    try {
      await client.connect();
      const db = client.db(DB_NAME);
      const collection = db.collection(COLLECTION_PRENOTAZIONI);
    
      const id = req.headers["id_prenotazione"];

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "ID non valido" });
      }
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
  
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Prenotazione non trovata" });
      }
  
      res.json({ message: "Prenotazione eliminata con successo" });
  
    } catch (error) {
      console.error("Errore nella cancellazione:", error);
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
  
      delete user.password;
  
      res.status(200).json({user: {
        _id: user._id,
        nome: user.nome,
        cognome: user.cognome,
        username: user.username,
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
  
      const user = await collection.findOne({ mail });
      if (!user) {
        return res.status(404).json({ message: "Utente non trovato." });
      }
      if (user.tesserato) {
        return res.status(400).json({ message: "Utente già tesserato." });
      }

      const result = await collection.updateOne(
        { mail },
        { $set: { tesserato: true } }
      );
  
      if (result.modifiedCount === 0) {
        return res.status(500).json({ message: "Errore durante l'aggiornamento dello stato di tesseramento." });
      }

      const token = jwt.sign({
          mail: user.mail,
          tesserato: true
        },
        JWT_SECRET,
        { expiresIn: TOKEN_EXPIRES_IN }
      );

      res.status(200).json({
        message: "Tesseramento completato con successo!",
        token,
      });
    } catch (error) {
      console.error("Errore nel tesseramento:", error);
      res.status(500).json({ message: "Errore interno del server" });
    } finally {
      await client.close();
    }
  });

  app.get("/api/escursioni", async (req, res) => {
    const client = new MongoClient(MONGO_URI);
    try {
      await client.connect();
      const db = client.db(DB_NAME);
      const collection = db.collection("Escursioni");

      const escursioni = await collection.find({ giorno: { $gte: today } }).toArray();
      res.json(escursioni);
    } catch (error) {
      console.error("Errore nel recupero delle escursioni:", error);
      res.status(500).json({ message: "Errore interno del server" });
    } finally {
      await client.close();
    }
  });

  app.post("/api/escursioni/:id/iscrivi", async (req, res) => {
    const client = new MongoClient(MONGO_URI);
    try {
      const { id } = req.params;
      const { utenteEmail } = req.body;
  
      if (!utenteEmail) {
        return res.status(400).json({ message: "Email utente mancante." });
      }
  
      await client.connect();
      const db = client.db(DB_NAME);
      const collection = db.collection("Escursioni");
  
      const escursione = await collection.findOne({ _id: new ObjectId(id) });
  
      if (!escursione) {
        return res.status(404).json({ message: "Escursione non trovata." });
      }
  
      if (escursione.partecipanti.includes(utenteEmail)) {
        return res.status(400).json({ message: "Utente già iscritto." });
      }
  
      if (escursione.partecipanti.length >= escursione.maxPartecipanti) {
        return res.status(400).json({ message: "Escursione al completo." });
      }
  
      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $push: { partecipanti: utenteEmail } }
      );
  
      const updated = await collection.findOne({ _id: new ObjectId(id) });
      res.json(updated);
    } catch (error) {
      console.error("Errore nell'iscrizione:", error);
      res.status(500).json({ message: "Errore interno del server" });
    } finally {
      await client.close();
    }
  });

  app.post("/api/escursioni/:id/disiscrivi", async (req, res) => {
    const client = new MongoClient(MONGO_URI);
    try {
      const { id } = req.params;
      const { utenteEmail } = req.body;
  
      if (!utenteEmail) {
        return res.status(400).json({ message: "Email utente mancante." });
      }
  
      await client.connect();
      const db = client.db(DB_NAME);
      const collection = db.collection("Escursioni");
  
      const escursione = await collection.findOne({ _id: new ObjectId(id) });
  
      if (!escursione) {
        return res.status(404).json({ message: "Escursione non trovata." });
      }
  
      if (!escursione.partecipanti.includes(utenteEmail)) {
        return res.status(400).json({ message: "Utente non iscritto." });
      }
  
      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $pull: { partecipanti: utenteEmail } }
      );
  
      const updated = await collection.findOne({ _id: new ObjectId(id) });
      res.json(updated);
    } catch (error) {
      console.error("Errore nella disiscrizione:", error);
      res.status(500).json({ message: "Errore interno del server" });
    } finally {
      await client.close();
    }
  });

  app.post("/api/bivacchi", async (req, res) => {
    const client = new MongoClient(MONGO_URI);
    try {
      await client.connect();
      const db = client.db(DB_NAME);
      const collection = db.collection(COLLECTION_BIVACCHI);
  
      const nuovoBivacco = req.body;
  
      if (!nuovoBivacco.nome || !nuovoBivacco.descrizione) {
        return res.status(400).json({ message: "Dati mancanti per il bivacco" });
      }
  
      const result = await collection.insertOne(nuovoBivacco);
      res.status(201).json({ message: "Bivacco aggiunto con successo", id: result.insertedId });
    } catch (error) {
      console.error("Errore nell'aggiunta del bivacco:", error);
      res.status(500).json({ message: "Errore interno del server" });
    } finally {
      await client.close();
    }
  });
  
  app.post("/api/percorsi", async (req, res) => {
    const client = new MongoClient(MONGO_URI);
    try {
      await client.connect();
      const db = client.db(DB_NAME);
      const collection = db.collection(COLLECTION_PERCORSI);
  
      const nuovoPercorso = req.body;
  
      if (!nuovoPercorso.nome || !nuovoPercorso.difficolta) {
        return res.status(400).json({ message: "Dati mancanti per il percorso" });
      }
  
      const result = await collection.insertOne(nuovoPercorso);
      res.status(201).json({ message: "Percorso aggiunto con successo", id: result.insertedId });
    } catch (error) {
      console.error("Errore nell'aggiunta del percorso:", error);
      res.status(500).json({ message: "Errore interno del server" });
    } finally {
      await client.close();
    }
  });

  app.get("/api/ricordi/prenotazioni", async (req, res) => {
  const client = new MongoClient(MONGO_URI);
    try {
      await client.connect();
      const db = client.db(DB_NAME);
      const collection = db.collection(COLLECTION_PRENOTAZIONI);

      const mail = req.headers["user_email"];
      if (mail) {
        const prenotazioni = await collection.find({ 
          mail,
          data: { $lt: today } 
        })
        .sort({data: 1})
        .toArray();
        return res.json(prenotazioni);
      }
      res.status(400).json({ message: "Email mancante!" });
  
    } catch (error) {
      console.error("Errore nel recupero delle prenotazioni:", error);
      res.status(500).json({ message: "Errore interno del server", prenotazioni: [] });
    } finally {
      await client.close();
    }
  })

  app.get("/api/ricordi/escursioni", async (req, res) => {
  const client = new MongoClient(MONGO_URI);
    try {
      await client.connect();
      const db = client.db(DB_NAME);
      const collection = db.collection("Escursioni");

      const mail = req.headers["user_email"];
      if (mail) {
        const escursioni = await collection.find({ 
          giorno: { $lt: today },
          partecipanti: mail
        })
        .sort({giorno: 1})
        .toArray();
        return res.json(escursioni);
      }
      res.status(400).json({ message: "Email mancante!" });
  
    } catch (error) {
      console.error("Errore nel recupero delle escursioni:", error);
      res.status(500).json({ message: "Errore interno del server", escursioni: [] });
    } finally {
      await client.close();
    }
  })

app.get('/api/user/favorites', async (req, res) => {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const utentiCollection = db.collection(COLLECTION_UTENTI);

    const userMail = req.headers["user_email"];
    if (!userMail) {
      return res.status(401).json({ message: "Utente non autenticato. Fornire 'user_email' nell'header." });
    }

    const user = await utentiCollection.findOne({ mail: userMail });

    if (!user) {
      return res.status(404).json({ message: "Utente non trovato." });
    }

    const userFavorites = Array.isArray(user.preferiti) ? user.preferiti : [];
    res.status(200).json({ favorites: userFavorites });
  } catch (error) {
    console.error('Errore server durante il recupero dei preferiti:', error);
    res.status(500).json({ message: 'Errore interno del server.' });
  } finally {
    await client.close();
  }
});

app.post('/api/user/favorites', async (req, res) => {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_UTENTI);

    const userMail = req.headers["user_email"];
    const { itemId, action } = req.body;

    if (!userMail) {
      return res.status(401).json({ message: "Non autenticato. Effettua il login per gestire i preferiti." });
    }

    if (!itemId || !['add', 'remove'].includes(action)) {
      return res.status(400).json({ message: 'Dati mancanti o azione non valida.' });
    }

    const user = await collection.findOne({ mail: userMail });

    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato.' });
    }

    if (!user.preferiti) {
      user.preferiti = [];
    }

    if (action === 'add') {
      if (!user.preferiti.includes(itemId)) {
        user.preferiti.push(itemId);
        await collection.updateOne(
          { mail: userMail },
          { $set: { preferiti: user.preferiti } }
        );
        return res.status(200).json({ message: 'Elemento aggiunto ai preferiti.', preferiti: user.preferiti });
      } else {
        return res.status(200).json({ message: 'Elemento già nei preferiti.', preferiti: user.preferiti });
      }
    } else if (action === 'remove') {
      const initialLength = user.preferiti.length;
      user.preferiti = user.preferiti.filter(favId => favId !== itemId);
      if (user.preferiti.length < initialLength) { 
        await collection.updateOne(
          { mail: userMail },
          { $set: { preferiti: user.preferiti } }
        );
        return res.status(200).json({ message: 'Elemento rimosso dai preferiti.', preferiti: user.preferiti });
      } else {
        return res.status(200).json({ message: 'Elemento non trovato nei preferiti.', preferiti: user.preferiti });
      }
    }
  } catch (error) {
    console.error('Errore server durante l\'aggiornamento dei preferiti:', error);
    res.status(500).json({ message: 'Errore interno del server.' });
  } finally {
    await client.close();
  }
});

app.post('/api/user/favorites/details', async (req, res) => {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const bivacchiCollection = db.collection(COLLECTION_BIVACCHI);
    const percorsiCollection = db.collection(COLLECTION_PERCORSI);

    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Nessun ID fornito." });
    }

    const objectIds = ids.filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id));

    const [bivacchi, percorsi] = await Promise.all([
      bivacchiCollection.find({ _id: { $in: objectIds } }).toArray(),
      percorsiCollection.find({ _id: { $in: objectIds } }).toArray()
    ]);

    const favorites = [
      ...bivacchi.map(b => ({ ...b, type: 'bivacco' })),
      ...percorsi.map(p => ({ ...p, type: 'percorso' }))
    ];

    res.status(200).json({ favorites });
  } catch (error) {
    console.error("Errore nel recupero dettagli preferiti:", error);
    res.status(500).json({ message: "Errore interno del server." });
  } finally {
    await client.close();
  }
});

app.get("/api/bivacchi/:id", async (req, res) => {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_BIVACCHI);

    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID non valido" });
    }

    const bivacco = await collection.findOne({ _id: new ObjectId(id) });

    if (!bivacco) {
      return res.status(404).json({ message: "Bivacco non trovato" });
    }

    res.status(200).json(bivacco);
  } catch (error) {
    console.error("Errore nel recupero del bivacco:", error);
    res.status(500).json({ message: "Errore interno del server" });
  } finally {
    await client.close();
  }
});

app.get("/api/bivacchi/:id", async (req, res) => {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_BIVACCHI);

    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID non valido" });
    }

    const bivacco = await collection.findOne({ _id: new ObjectId(id) });

    if (!bivacco) {
      return res.status(404).json({ message: "Bivacco non trovato" });
    }

    res.status(200).json(bivacco);
  } catch (error) {
    console.error("Errore nel recupero del bivacco:", error);
    res.status(500).json({ message: "Errore interno del server" });
  } finally {
    await client.close();
  }
});

app.post("/api/bivacchi/vota", async (req, res) => {
    const client = new MongoClient(MONGO_URI);
    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_BIVACCHI);

        const { bivaccoId, voto } = req.body;
        const userEmail = req.headers.user_email;

        if (!bivaccoId || !ObjectId.isValid(bivaccoId)) {
            return res.status(400).json({ message: "ID bivacco non valido" });
        }
        if (typeof voto !== "number" || voto < 1 || voto > 5) {
            return res.status(400).json({ message: "Voto deve essere un numero tra 1 e 5" });
        }
        if (!userEmail) {
            return res.status(401).json({ message: "Email utente non fornita per la recensione." });
        }

        const bivacco = await collection.findOne({ _id: new ObjectId(bivaccoId) });
        if (bivacco && bivacco.recensioni && bivacco.recensioni.some(r => r.userEmail === userEmail)) {
            return res.status(409).json({ message: "Hai già recensito questo bivacco." });
        }

        const result = await collection.updateOne(
            { _id: new ObjectId(bivaccoId) },
            { $push: { recensioni: { userEmail: userEmail, voto: voto } } } 
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Bivacco non trovato" });
        }

        res.status(200).json({ message: "Voto registrato con successo" });

    } catch (error) {
        console.error("Errore nell'inserimento del voto:", error);
        res.status(500).json({ message: "Errore interno del server" });
    } finally {
        await client.close();
    }
});

app.post("/api/bivacchi/user-votes", async (req, res) => {
    const client = new MongoClient(MONGO_URI);

    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_BIVACCHI);

        const { bivaccoIds } = req.body;
        const userEmail = req.headers.user_email; 

        if (!Array.isArray(bivaccoIds) || bivaccoIds.length === 0) {
            return res.status(400).json({ message: "Elenco di ID bivacco non valido" });
        }

        if (!userEmail) {
            return res.status(401).json({ message: "Email utente non fornita." });
        }

        const objectIdBivaccoIds = bivaccoIds.map(id => {
            if (!ObjectId.isValid(id)) {
                console.warn(`Invalid ObjectId in request: ${id}`);
                return null;
            }
            return new ObjectId(id);
        }).filter(id => id !== null);

        if (objectIdBivaccoIds.length === 0 && bivaccoIds.length > 0) {
            return res.status(400).json({ message: "Nessun ID bivacco valido fornito." });
        }

        const bivacchi = await collection.find(
            { _id: { $in: objectIdBivaccoIds } },
            { projection: { _id: 1, recensioni: 1 } }
        ).toArray();

        const userVotes = {};
        bivacchi.forEach(bivacco => {
            const userReview = bivacco.recensioni?.find(review => review.userEmail === userEmail);
            if (userReview) {
                userVotes[bivacco._id.toString()] = userReview.voto;
            }
        });

        res.status(200).json(userVotes);

    } catch (error) {
        console.error("Errore nel recupero dei voti utente:", error);
        res.status(500).json({ message: "Errore interno del server" });
    } finally {
        await client.close();
    }
});
app.post("/api/percorsi/vota", async (req, res) => {
    const client = new MongoClient(MONGO_URI);
    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_PERCORSI); 

        const { percorsoId, voto } = req.body;
        const userEmail = req.headers.user_email; 

        if (!percorsoId || !ObjectId.isValid(percorsoId)) {
            return res.status(400).json({ message: "ID percorso non valido" });
        }
        if (typeof voto !== "number" || voto < 1 || voto > 5) {
            return res.status(400).json({ message: "Voto deve essere un numero tra 1 e 5" });
        }
        if (!userEmail) { 
            return res.status(401).json({ message: "Email utente non fornita per la recensione." });
        }

        const percorso = await collection.findOne({ _id: new ObjectId(percorsoId) });
        if (percorso && percorso.recensioni && percorso.recensioni.some(r => r.userEmail === userEmail)) {
            return res.status(409).json({ message: "Hai già recensito questo percorso." });
        }

        const result = await collection.updateOne(
            { _id: new ObjectId(percorsoId) },
            { $push: { recensioni: { userEmail: userEmail, voto: voto } } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Percorso non trovato" });
        }

        res.status(200).json({ message: "Voto percorso registrato con successo" });

    } catch (error) {
        console.error("Errore nell'inserimento del voto percorso:", error);
        res.status(500).json({ message: "Errore interno del server" });
    } finally {
        await client.close();
    }
});

app.post("/api/percorsi/user-votes", async (req, res) => {
    const client = new MongoClient(MONGO_URI);

    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_PERCORSI);

        const { percorsoIds } = req.body;
        const userEmail = req.headers.user_email;

        if (!Array.isArray(percorsoIds) || percorsoIds.length === 0) {
            return res.status(400).json({ message: "Elenco di ID percorso non valido" });
        }
        if (!userEmail) {
            return res.status(401).json({ message: "Email utente non fornita." });
        }

        const objectIdPercorsoIds = percorsoIds.map(id => {
            if (!ObjectId.isValid(id)) {
                console.warn(`Invalid ObjectId for percorso: ${id}`);
                return null;
            }
            return new ObjectId(id);
        }).filter(id => id !== null);

        if (objectIdPercorsoIds.length === 0 && percorsoIds.length > 0) {
            return res.status(400).json({ message: "Nessun ID percorso valido fornito." });
        }

        const percorsi = await collection.find(
            { _id: { $in: objectIdPercorsoIds } },
            { projection: { _id: 1, recensioni: 1 } } 
        ).toArray();

        const userPathVotes = {};
        percorsi.forEach(percorso => {
            const userReview = percorso.recensioni?.find(review => review.userEmail === userEmail);
            if (userReview) {
                userPathVotes[percorso._id.toString()] = userReview.voto;
            }
        });

        res.status(200).json(userPathVotes);

    } catch (error) {
        console.error("Errore nel recupero dei voti percorso utente:", error);
        res.status(500).json({ message: "Errore interno del server" });
    } finally {
        await client.close();
    }
});

app.get("/api/percorsi/:id", async (req, res) => {
    const client = new MongoClient(MONGO_URI);
    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_PERCORSI);

        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID percorso non valido" });
        }

        const percorso = await collection.findOne({ _id: new ObjectId(id) });

        if (!percorso) {
            return res.status(404).json({ message: "Percorso non trovato" });
        }
        res.status(200).json(percorso);

    } catch (error) {
        console.error("Errore nel recupero del percorso:", error);
        res.status(500).json({ message: "Errore interno del server" });
    } finally {
        await client.close();
    }
});

app.listen(PORT, () => {
  console.log(`Server in esecuzione su http://localhost:${PORT}`);
});