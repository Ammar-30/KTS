# KIPS Transport (Next.js 16 + Prisma + SQLite)

Role-based transport request flow with 2-step approval and email on assignment. Minimal CSS, strict TypeScript, JWT cookie auth.

## Stack
- Next.js 16 (App Router), React 19
- Prisma ORM + SQLite
- `jose` (JWT), `bcrypt` (passwords)
- Nodemailer SMTP (safe no-op when unset)

## Setup

```bash
# 1) Install
npm i

# 2) Create DB & migrate
npx prisma migrate dev --name init

# 3) Seed users
npm run seed

# 4) Run dev
npm run dev

# 5) (optional) Prisma Studio
npm run studio
```

### Accounts (seeded)
- EMPLOYEE: salmanammar322@gmail.com / Pass@1234
- MANAGER : salmanmaqsood7@gmail.com / Pass@1234
- TRANSPORT: transport@kips.pk / Pass@1234

## Env
Copy `.env.example` to `.env` and set:
```
DATABASE_URL="file:./dev.db"
JWT_SECRET=some-long-random-string
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
MAIL_FROM="KIPS Transport <no-reply@kips.pk>"
```

If mail envs are missing, emails will **not** send (logged to console instead).

## Flow
1. **Employee** creates request with **Company** (KIPS Preps / TETB / Quality Brands / KDP) and optional **Department**.
2. **Manager** approves/rejects.
3. **Transport** assigns driver/vehicle → requester gets email (includes Company & Department).

## Routes
- `/login` — sign in (redirects by role)
- `/employee` — request form + "My Trips"
- `/manager` — pending list (approve/reject)
- `/transport` — approved list (assign)
- `/profile` — change password

## APIs
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET  /api/auth/me`
- `POST /api/auth/change-password`

- `POST /api/trips/create`
- `GET  /api/trips/my`
- `GET  /api/trips/pending`
- `POST /api/trips/approve`
- `GET  /api/trips/approved`
- `POST /api/trips/assign`

All endpoints return structured JSON with proper status codes.

## Notes
- Emails/usernames are immutable (only password changes).
- Guards: visiting dashboards without session redirects to `/login`.
- Minimal styling; we’ll refine UI later.
