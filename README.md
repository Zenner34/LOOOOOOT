# LOOOOOOT — WoW TBC Raid Loot Tracker

A Next.js web app for tracking Burning Crusade raid loot. Browse phase → raid → boss → item,
build multiple rosters (splits), track attendance per raid night, fast-assign loot to raiders,
and get a live **Overview** of each character's gearing progress with **Tanks / Healers / DPS**
tabs showing item count and a **BiS-weighted score** per spec.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Prisma + Postgres (Supabase in prod; any Postgres works locally)
- bcryptjs + HMAC-signed cookie auth (single admin password, reads public)

## Local dev

```bash
npm install
cp .env.example .env          # fill in DATABASE_URL, DIRECT_URL, hash, secret
npx prisma migrate dev        # creates tables in your Postgres
npx tsx prisma/seed.ts        # seeds 5 phases, 9 raids, 50 bosses, ~420 items
npm run dev                   # http://localhost:3000
```

### Admin password

```bash
# Generate a bcrypt hash
node -e "console.log(require('bcryptjs').hashSync('your-pw-here', 10))"
# Generate an auth secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Put them in `.env`. **Escape every `$` in the bcrypt hash** as `\$` (Next.js expands env vars dotenv-style):

```
ADMIN_PASSWORD_HASH="\$2a\$10\$...rest...of...hash"
AUTH_SECRET="<long hex string>"
```

Log in at `/login` to unlock admin actions.

## Deploying to Vercel (with Supabase Postgres)

### 1. Create the Supabase project

1. https://supabase.com → new project.
2. Project Settings → Database → copy **both**:
   - **Connection pooling (Transaction)** URI — this is `DATABASE_URL` (port `6543`, add `?pgbouncer=true&connection_limit=1`)
   - **Connection string (URI)** — this is `DIRECT_URL` (port `5432`)
3. URL-encode special characters in the password.

### 2. Run the initial migration + seed against Supabase

From your local machine (once):

```bash
DATABASE_URL="<pooled>" DIRECT_URL="<direct>" npx prisma migrate deploy
DATABASE_URL="<pooled>" DIRECT_URL="<direct>" npx tsx prisma/seed.ts
```

(The `vercel-build` script also runs `prisma migrate deploy` on every deploy, so future schema
changes pushed to the repo apply automatically.)

### 3. Deploy

```bash
npm i -g vercel
vercel login
vercel            # first run: answer prompts, link project
vercel --prod
```

Or push to GitHub and import the repo at https://vercel.com/new.

### 4. Set env vars in Vercel

Project → Settings → Environment Variables (Production + Preview):

| Var | Value |
|---|---|
| `DATABASE_URL` | pooled Supabase URI (port 6543, `?pgbouncer=true&connection_limit=1`) |
| `DIRECT_URL` | direct Supabase URI (port 5432) |
| `ADMIN_PASSWORD_HASH` | bcrypt hash — in Vercel's UI you do **not** need to escape `$` |
| `AUTH_SECRET` | long random hex string |

Redeploy. Log in at `/login` and you're live.

## Data model

See `prisma/schema.prisma`. The key entities:

- **Phase → Raid → Boss → Item** — the TBC loot catalog (static, seeded)
- **ItemWeight** — per-spec weights (0.0-1.0) used by the Overview score
- **Character** — name/class/spec/role (tank|heal|dps)
- **Roster** — a named raid group; guilds running splits have multiple
- **RosterMember** — character in a roster with memberRole (main|bench|trial)
- **RaidNight + Attendance** — session-level attendance tracking per roster
- **LootAward** — itemId + characterId + rosterId (+ optional raidNightId)

## Extending the loot catalog

Loot lives in `lib/tbc-data.ts`. Each item has an `archetype` tag (e.g. `tank-plate`,
`weapon-bow`, `token-vanquisher`) which expands into per-spec weights via
`lib/archetypes.ts`. Override individual weights per item with the `weights` map.
Re-run `npx tsx prisma/seed.ts` to upsert changes — the seeder is idempotent and
rewrites weights so edits propagate.

## Routes

| Path | Purpose |
|---|---|
| `/overview` | Tanks / Healers / DPS tabs, weighted scoring, drilldown per character |
| `/loot` | Browse phase → raid → boss → items with award history |
| `/loot/assign` | Admin fast-assign UI (3-pane) |
| `/characters` | Character CRUD |
| `/rosters` | Roster list |
| `/rosters/[id]` | Roster detail — add/remove members, set role (main/bench/trial) |
| `/attendance` | Raid-night index |
| `/attendance/[id]` | Mark present/late/absent for a night's roster |
| `/login` | Admin login |
