const crypto = require('crypto');

// Simple in-memory session store. For production, use Redis or a DB.
const sessions = new Map(); // sid -> { key: Buffer, createdAt: Date }

const TTL_MS = 1000 * 60 * 60; // 1 hour

function setSessionKey(rawKeyBase64) {
  const key = Buffer.from(rawKeyBase64, 'base64');
  if (![16, 24, 32].includes(key.length)) {
    throw new Error('Key must be 128/192/256-bit raw bytes (base64-encoded).');
  }
  const sid = crypto.randomUUID();
  sessions.set(sid, { key, createdAt: Date.now() });
  // GC expired sessions
  for (const [id, s] of sessions.entries()) {
    if (Date.now() - s.createdAt > TTL_MS) sessions.delete(id);
  }
  return sid;
}

function getSessionKey(sid) {
  const rec = sessions.get(sid);
  if (!rec) return null;
  if (Date.now() - rec.createdAt > TTL_MS) {
    sessions.delete(sid);
    return null;
  }
  return rec.key;
}

function encryptJSONForSid(sid, obj) {
  const key = getSessionKey(sid);
  if (!key) throw new Error('Missing or expired session key');

  const iv = crypto.randomBytes(12); // AES-GCM 96-bit nonce
  const cipher = crypto.createCipheriv(`aes-${key.length*8}-gcm`, key, iv);
  const plaintext = Buffer.from(JSON.stringify(obj), 'utf8');
  const enc = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  const payload = Buffer.concat([enc, tag]); // WebCrypto expects tag appended
  return {
    iv: iv.toString('base64'),
    data: payload.toString('base64'),
    alg: `AES-${key.length*8}-GCM`
  };
}

module.exports = { setSessionKey, getSessionKey, encryptJSONForSid };
