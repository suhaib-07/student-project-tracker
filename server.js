
import express from 'express';

const app = express();

// Parse incoming JSON request bodies, up to 10 KB.
app.use(express.json({ limit: '10kb' }));

// Serve the existing frontend files.
app.use(express.static('public'));

// Health-check API route.
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

const port = Number(process.env.PORT || 3000);

app.listen(port, () => console.log(`Open http://localhost:${port}`));
