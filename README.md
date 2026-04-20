# LOOOOOOT — WoW TBC Raid Loot Tracker

A Next.js web app for tracking Burning Crusade raid loot. Browse phase → raid → boss → item,
build multiple rosters (splits), track attendance per raid night, fast-assign loot to raiders,
and get a live **Overview** of each character's gearing progress with **Tanks / Healers / DPS**
tabs showing item count and a **BiS-weighted score** per spec.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Prisma + SQLite
- bcryptjs + HMAC-signed cookie auth (single admin password, reads public)

## Quick start

```bash
npm install
cp .env.example .env   # then edit with your own hash + secret (see below)
npx prisma migrate dev
npx tsx prisma/seed.ts  # seeds 5 phases, 9 raids, 50 bosses, ~420 items with BiS weights
npm run dev
```

Open http://localhost:3000 — `/overview` is the landing page.

### Set the admin password

```bash
# Generate a bcrypt hash for your password (escape $ in .env, see below)
node -e "console.log(require('bcryptjs').hashSync('your-pw-here', 10))"

# Generate an auth secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Put them in `.env`. **Escape every `$` in the bcrypt hash** as `\$` because Next.js expands
env vars dotenv-style:

```
ADMIN_PASSWORD_HASH="\$2a\$10\$...rest...of...hash"
AUTH_SECRET="<long hex string>"
```

Log in at `/login` to unlock admin actions (create rosters, add characters, assign loot, mark attendance).

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
