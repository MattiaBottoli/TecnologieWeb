// server.js
app.get('/api/bollettini', async (req, res) => {
    const { name } = req.query;
    try {
      const data = await Bollettini.findOne({ name: name });
      if (!data) {
        return res.status(404).json({ error: 'Dati non trovati' });
      }
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Errore nel recupero dei dati' });
    }
  });
  