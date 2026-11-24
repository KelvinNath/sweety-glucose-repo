# Sweety – Blood Glucose Tracker

Sweety is a personal blood glucose tracker. A user registers, signs in, and records up to four readings a day. The app shows today's summary, a reading history, and daily, month-to-date, and previous-month reports. Each account can access only its own readings.

Repository: [https://github.com/KelvinNath/sweety-glucose-repo](https://github.com/KelvinNath/sweety-glucose-repo)

## Key features

- User registration and login
- Secure password hashing and JWT authentication
- Personal glucose reading management
- Four daily reading slots: Morning, After Breakfast, After Lunch, and After Dinner
- Reading validation and one reading per slot per day
- Glucose values from 40 to 600 mg/dL, with no future dates
- Daily, month-to-date, and previous-month reports
- Dashboard statistics and an account profile

Empty reports return zero readings and null statistics.

## Tech stack

Versions are the ranges declared in each `package.json`. The UI is JavaScript. Prisma **6.19.3** is the version in use. Do not upgrade it.

**Frontend:** React ^19.3.1, React DOM ^19.3.1, React Router ^7.18.6, Vite ^8.3.6, Tailwind CSS ^4.3.5, shadcn ^4.23.0, Base UI ^1.9.0, lucide-react ^1.79.0, and ESLint ^10.14.0.

**Backend:** Express ^5.3.0, Prisma and @prisma/client ^6.19.3, PostgreSQL, bcryptjs ^3.0.3, jsonwebtoken ^9.0.3, express-validator ^7.3.2, cors ^2.8.6, dotenv ^18.0.10, and nodemon ^3.1.14.

## Project structure

```text
sweety-glucose-repo/
├── client/                 React + Vite frontend
│   ├── src/components/     Layout, dashboard, readings, and reports
│   ├── src/context/        AuthContext
│   ├── src/pages/          Login, Register, Dashboard, Readings, Reports, Profile
│   ├── src/services/       API, auth, readings, and reports clients
│   └── .env.example
├── server/
│   ├── prisma/             Schema, migration, and seed script
│   ├── src/                Routes, controllers, services, and validators
│   └── .env.example
└── README.md
```

## Prerequisites

- Node.js and npm
- PostgreSQL running locally

`DATABASE_URL` and `JWT_SECRET` are backend-only secrets. They belong in `server/.env`, which is gitignored. The frontend only needs the public API base URL.

## PostgreSQL setup

Create a database named `sweety_db`:

```sql
CREATE DATABASE sweety_db;
```

Or:

```bash
createdb sweety_db
```

## Backend setup

From the `server` directory:

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env`:

- `PORT` — API port. The application uses **5001**.
- `DATABASE_URL` — PostgreSQL connection string for `sweety_db`.
- `JWT_SECRET` — a long random secret used only to sign tokens.

Do not commit `server/.env`.

## Database migration and seed

Stay in `server`. Apply the migration, generate the Prisma Client, and load the demo data:

```bash
npx prisma migrate dev
npx prisma generate
npm run db:seed
```

`npm run db:seed` runs `prisma db seed`. Prisma 6 prints a deprecation warning because the seed command is set with `prisma.seed` in `server/package.json`. The command still works.

The seed creates or updates one evaluation user and sample readings for the last seven days in Asia/Kolkata, including today. It does not delete other users or readings. Running it again updates the same demo rows.

## Demo credentials

This account is for evaluation only. The password is stored in `server/prisma/seed.js` and must not be used in production. The database stores only its bcrypt hash.

| Field | Value |
| --- | --- |
| Name | Demo Patient |
| Email | demo@sweety.local |
| Password | SweetyDemo123! |

## Frontend setup

From the `client` directory:

```bash
cd client
npm install
cp .env.example .env.local
```

`client/.env.example` contains:

```text
VITE_API_BASE_URL=http://localhost:5001/api
```

`client/.env.local` is gitignored. The base URL already ends in `/api`.

## Running the application

Use two terminals.

Terminal 1, from `server`:

```bash
npm run dev
```

The API listens on [http://localhost:5001](http://localhost:5001).

Terminal 2, from `client`:

```bash
npm run dev
```

Vite serves the app at [http://localhost:5173](http://localhost:5173).

## API overview

Base URL: `http://localhost:5001/api`. Protected routes require `Authorization: Bearer <token>`. Readings and reports are limited to the authenticated user. A date is `YYYY-MM-DD` and cannot be in the future relative to Asia/Kolkata.

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/health` | No | Check that the API is running |
| POST | `/auth/register` | No | Create an account and return a token |
| POST | `/auth/login` | No | Sign in and return a token |
| GET | `/auth/me` | Yes | Return the current user |
| GET | `/readings` | Yes | List the current user's readings |
| POST | `/readings` | Yes | Create a reading |
| PUT | `/readings/:id` | Yes | Update a reading |
| DELETE | `/readings/:id` | Yes | Delete a reading |
| GET | `/reports/daily?date=YYYY-MM-DD` | Yes | One day, with readings and statistics |
| GET | `/reports/mtd?date=YYYY-MM-DD` | Yes | Statistics from the 1st of that month through the date |
| GET | `/reports/monthly?date=YYYY-MM-DD` | Yes | Statistics for the previous calendar month |

## Testing

There is no automated backend test suite. From `server`, `npm test` is a placeholder and exits with an error.

From `client`:

```bash
npm run lint
npm run build
```

Manual checks, with PostgreSQL, the API, and the frontend running:

- Register, confirm the header shows your name, sign out, and sign in again.
- Confirm a wrong password and a duplicate email are rejected.
- Add, edit, and delete a reading. Confirm it appears on the dashboard and is removed after deletion.
- Save the same date and slot again and confirm the duplicate is rejected.
- Open Daily, Month to date, and Last month. An empty day shows zero readings and null statistics.
- Sign in as the demo user and confirm another account's readings are not visible.

## Assumptions and future improvements

- Calendar dates use Asia/Kolkata and are stored as PostgreSQL dates.
- The browser keeps the JWT in `localStorage` under `sweety_auth_token`.
- The demo account exists only for evaluation.

Possible later work, not implemented here: automated tests, profile editing, password reset, trend charts, a CORS allowlist, and refresh tokens.
