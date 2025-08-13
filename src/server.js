const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const { setSessionKey } = require('./crypto/session');
const productsRouter = require('./routes/products');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

// Static frontend
app.use('/', express.static(path.join(__dirname, '..', 'public')));

// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Handshake: client sends base64-encoded AES key (128/192/256-bit raw)
app.post('/api/handshake', (req, res) => {
  try {
    const rawKeyBase64 = req.body?.key;
    if (!rawKeyBase64) return res.status(400).json({ error: 'Missing key' });
    const sid = setSessionKey(rawKeyBase64);
    res.cookie('sid', sid, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60,
    });
    res.json({ ok: true, alg: 'AES-GCM' });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: e.message || 'Bad Request' });
  }
});

// Products API (encrypted)
app.use('/api/products', productsRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
