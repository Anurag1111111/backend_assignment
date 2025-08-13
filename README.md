# BrightBeans Backend Assignment (MySQL + MongoDB + Prisma + Encrypted API)

This repository implements the full assignment flow:
- Read the provided JSON (`data/data.json`) and ingest it
- Store the data into **MySQL** (SQL) and **MongoDB** (NoSQL) using **Prisma**
- Build a backend API that **only serves data fetched via Prisma** (not from the file)
- Transmit data **encrypted** from backend to frontend
- Decrypt in the browser and **render human-readable** results on a simple HTML page

## Tech choices

- Node.js + Express
- Prisma ORM (two separate clients via two schema files)
- SQL: **MySQL 8** (JSON columns used for flexible fields)
- NoSQL: **MongoDB 6**
- AES-GCM encryption of API responses (handshake establishes a per-session symmetric key)


## Running locally

### 0) Requirements

- Node 18+
- Docker (recommended) or local MySQL 8 and MongoDB 6 instances

### 1) Start databases (Docker)

```bash
docker compose up -d
```

### 2) Configure environment

```bash
cp .env.example .env
```

### 3) Install deps + generate Prisma clients

```bash
npm i
npm run prisma:generate   
npm run prisma:migrate

```

(MongoDB does not require migrations.)

### 4) Seed both databases from the JSON file

```bash
npm run seed
```

### 5) Start server

```bash
npm run dev
```

Visit **http://localhost:3000**. Click **"Start Secure Session"** (generates an AES key in the browser and posts it to `/api/handshake`), then **"Load Products"** to fetch encrypted data.

- In **Network** tab you'll see `/api/products` returns `{ iv, data, alg }` (ciphertext only).
- The UI decrypts using the Web Crypto API and renders a readable table.

## API Overview

- `POST /api/handshake`  
  Body: `{ "key": "<base64 raw AES key (128/192/256-bit)>" }`  
  Sets an `sid` cookie. The server stores the key in-memory for 1 hour.  
  Response: `{ ok: true, alg: "AES-GCM" }`

- `GET /api/products?source=mysql|mongo`  
  Requires `sid` cookie from handshake. Returns encrypted payload:  
  `{ iv: base64, data: base64, alg: "AES-256-GCM" }`  
  The decrypted JSON object has shape: `{ products: [...] }`

- `GET /api/products/:id?source=mysql|mongo`  
  Same as above; decrypted payload: `{ product: {...} }`

## Prisma models

- **MySQL** uses one `Product` table with `Json` columns for flexible arrays/objects (`tags`, `images`, `reviews`, `dimensions`, `meta`). This keeps the schema compact and is sufficient for this task.
- **MongoDB** stores a `Product` document per item. We preserve the original numeric `id` as `productId` (unique) and let Mongo use its native `_id` for the primary key.


## How to demo to reviewers

1. Open DevTools → Network.
2. Click **Start Secure Session** → **Load Products**.
3. Inspect the `/api/products` response: only `iv`, `data`, `alg` — no raw product JSON.
4. Watch the UI decrypt and render the table.

## Notes

- Restarting the server clears in-memory sessions; click **Start Secure Session** again.
- If you change Prisma models, run `npm run prisma:generate` again, and for MySQL also run `npm run prisma:migrate`.


