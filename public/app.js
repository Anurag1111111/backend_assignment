let sessionKey = null; // CryptoKey
const status = document.getElementById('status');
const loadBtn = document.getElementById('loadBtn');
const handshakeBtn = document.getElementById('handshakeBtn');
const sourceSel = document.getElementById('source');
const tbody = document.querySelector('#productsTable tbody');

function setStatus(msg) {
  status.textContent = msg;
}

function ab2b64(buf) {
  const bytes = new Uint8Array(buf);
  let str = '';
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str);
}
function b642ab(b64) {
  const str = atob(b64);
  const buf = new ArrayBuffer(str.length);
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i);
  return buf;
}

async function startHandshake() {
  setStatus('Generating AES-GCM key...');
  sessionKey = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  const raw = await crypto.subtle.exportKey('raw', sessionKey);
  const body = JSON.stringify({ key: ab2b64(raw) });
  setStatus('Sending key to server to start secure session...');
  const res = await fetch('/api/handshake', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    credentials: 'include',
  });
  if (!res.ok) {
    setStatus('Handshake failed.');
    return;
  }
  setStatus('Secure session established. Now load data.');
  loadBtn.disabled = false;
}

async function decryptPayload(payload) {
  const iv = b642ab(payload.iv);
  const data = b642ab(payload.data);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, sessionKey, data);
  const text = new TextDecoder().decode(plain);
  return JSON.parse(text);
}

async function loadProducts() {
  if (!sessionKey) return setStatus('Please start secure session first.');
  setStatus('Fetching encrypted data... Check the Network tab, you will only see ciphertext.');
  const src = sourceSel.value;
  const res = await fetch(`/api/products?source=${encodeURIComponent(src)}`, {
    credentials: 'include',
  });
  if (!res.ok) {
    setStatus('Failed to fetch products.');
    return;
  }
  const payload = await res.json();
  const data = await decryptPayload(payload);
  renderTable(data.products || []);
  setStatus(`Loaded ${data.products?.length || 0} products from ${src.toUpperCase()}.`);
}

function renderTable(rows) {
  tbody.innerHTML = '';
  for (const p of rows) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${escapeHtml(p.title)}</td>
      <td>${escapeHtml(p.category)}</td>
      <td>$${Number(p.price).toFixed(2)}</td>
      <td>${Number(p.rating).toFixed(2)}</td>
      <td>${p.stock}</td>
      <td>${Number(p.discountPercentage).toFixed(2)}</td>
      <td>${escapeHtml(p.brand)}</td>
    `;
    tbody.appendChild(tr);
  }
}

function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

handshakeBtn.addEventListener('click', startHandshake);
loadBtn.addEventListener('click', loadProducts);
