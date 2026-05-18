# VoterMap

Mobile-first PWA for voter mapping and election management. Offline-first with sync to **PostgreSQL (Neon)**.

## Free tier stack (launch)

| Service | Free tier | Use |
|---------|-----------|-----|
| [Neon](https://neon.tech) | 512 MB storage, compute hours | PostgreSQL (~50 lakh voters at scale) |
| [Vercel](https://vercel.com) | Hobby hosting | PWA + API |
| Browser IndexedDB | Unlimited local | Offline cache + sync queue |

Upgrade Neon/Vercel when the client scales.

## Quick start

1. Create a **Neon** project and copy `DATABASE_URL`.
2. Copy `.env.example` → `.env` and set `JWT_SECRET`.
3. For quick local start (no Neon yet), keep `USE_LOCAL_DB=true` in `.env` (auto-enabled if `DATABASE_URL` is still the placeholder).
4. Install and migrate:

```bash
npm install
npm run db:migrate
npm run dev
```

If you see **Cannot reach API**, the backend on port 3001 is not running:

```bash
npm run dev:kill-ports   # free stuck ports
npm run dev              # starts API + web (wait for "API server http://localhost:3001")
```

Use **one** terminal for `npm run dev` — do not run only `vite` alone.

### Vercel environment variables

In [Vercel Dashboard](https://vercel.com) → your project → **Settings** → **Environment Variables**, add:

| Variable | Value | Environments |
|----------|--------|--------------|
| `DATABASE_URL` | Your Neon connection string (`postgresql://...?sslmode=require`) | Production, Preview, Development |
| `JWT_SECRET` | Long random string (e.g. `openssl rand -hex 32`) | Production, Preview, Development |
| `USE_LOCAL_DB` | Not needed on Vercel — omit it | — |
| `ADMIN_DEFAULT_PASSWORD` | `1KTR@1` (optional; first-time setup only) | Development (optional) |

Do **not** set `VITE_API_URL` on Vercel — the app calls `/api` on the same domain.

CLI alternative:

```bash
npx vercel env add DATABASE_URL
npx vercel env add JWT_SECRET
```

After linking Neon, run `npm run db:push` once locally (with `DATABASE_URL` in `.env`) to create tables — already done if schema was pushed.

4. Open http://localhost:5173 → **Setup admin** (username `admin`, password `1KTR@1`).
5. **Telangana SIR:** Admin → **SIR** tab → load 119 Assembly constituencies, then **Setup** → add divisions (BLO polling parts from CEO mapping).
6. Or CLI: `npm run seed:telangana` (requires `DATABASE_URL` in `.env`).
7. Add representatives per division. Share auto-generated `Hyd53R1` credentials with BLOs/reps.

## Scripts

- `npm run dev` — Vite + API (port 3001)
- `npm run build` — production build
- `npm run db:push` — push Drizzle schema to Neon
- `npm run seed:telangana` — seed 119 Telangana ACs + SIR schedule settings

## Telangana SIR (Special Intensive Revision)

Reference data lives in `data/telangana/` (schedule, 119 Assembly constituencies, GHMC structure notes, ECI form mapping). **Divisions** = BLO work areas / polling parts — add from CEO Telangana mapping (June 15–24), not auto-generated (especially GHMC’s 300 wards).

Official portals: [CEO Telangana](https://ceotelangana.nic.in/), [electoral rolls](https://ceotserms2.telangana.gov.in/ts_erolls/rolls.aspx), [voter search](https://electoralsearch.eci.gov.in/).

## Rep workflow

1. Install PWA on phone (Add to Home Screen).
2. Login with username/password from super admin.
3. Account binds to that device only.
4. Add voters offline; tap **Update** to sync (green tick = saved on server).

## Username format

`{CorpCode}{DivisionNumber}R{RepNumber}` — e.g. `Hyd53R1` = Hyderabad corp, division 53, rep 1.
