# Sweety – Blood Glucose Tracker

Sweety is a personal blood glucose tracker. A person registers, signs in, and records up to four readings a day. The app shows today's summary, a history of readings, and daily, month-to-date, and previous-month reports.

Each account sees only its own readings. The API identifies the user from a JSON Web Token and stores every reading against that user.

Repository: [https://github.com/KelvinNath/sweety-glucose-repo](https://github.com/KelvinNath/sweety-glucose-repo)

## Key features

- User registration and login
- Secure password hashing and JWT authentication
- Personal glucose reading management
- Four daily reading slots
- Reading validation and duplicate prevention
- Daily, month-to-date, and previous-month reports
- Dashboard statistics and account profile

## Tech stack

Versions below are the ranges declared in the project `package.json` files. Prisma is **6.19.3** and is not upgraded by this project.

### Frontend (`client`)

| Package | Declared version |
| --- | --- |
| React | ^19.3.1 |
| React DOM | ^19.3.1 |
| React Router | ^7.18.6 |
| Vite | ^8.3.6 |
| Tailwind CSS | ^4.3.5 |
| @tailwindcss/vite | ^4.3.5 |
| shadcn | ^4.23.0 |
| @base-ui/react | ^1.9.0 |
| class-variance-authority | ^0.7.1 |
| cn | ^0.5.2 |
| lucide-react | ^1.79.0 |
| Geist font | ^5.3.0 |
| tw-animate-css | ^1.4.0 |
| ESLint | ^10.14.0 |

The interface is JavaScript (JSX), not TypeScript. Installed shadcn components are Button, Avatar, and Separator.

### Backend (`server`)

| Package | Declared version |
| --- | --- |
| Express | ^5.3.0 |
| Prisma and @prisma/client | ^6.19.3 |
| PostgreSQL | via Prisma |
| bcryptjs | ^3.0.3 |
| jsonwebtoken | ^9.0.3 |
| express-validator | ^7.3.2 |
| cors | ^2.8.6 |
| dotenv | ^18.0.10 |
| nodemon | ^3.1.14 |

Passwords are hashed with bcrypt using 12 salt rounds. Tokens expire after 7 days and carry `{ userId }`. The API never returns the password hash.

## Project structure

```text
sweety-glucose-repo/
├── client/                 React + Vite frontend
│   ├── src/components/     Layout, auth guards, dashboard, readings, reports
│   ├── src/context/        AuthContext
│   ├── src/pages/          Login, Register, Dashboard, Readings, Reports, Profile
│   ├── src/services/       API, auth, readings, and reports clients
│   └── .env.example
├── server/
│   ├── prisma/             Schema, migration, and seed script
│   ├── src/controllers/
│   ├── src/middleware/
│   ├── src/routes/
│   ├── src/services/
│   ├── src/validators/
│   ├── src/utils/          Password hashing and JWT helpers
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

Or, if `createdb` is available:

```bash
createdb sweety_db
```

## Backend installation and configuration

From the `server` directory:

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env` and replace the placeholders:

- `PORT` — the API port. The application defaults to **5001**.
- `DATABASE_URL` — your PostgreSQL user, password, host, and the `sweety_db` database.
- `JWT_SECRET` — a long random string used only to sign tokens.

Do not commit `server/.env`.

## Prisma migration and client generation

Stay in the `server` directory. This project uses Prisma 6.19.3.

Apply the existing migration and create the tables:

```bash
npx prisma migrate dev
```

Generate the Prisma Client:

```bash
npx prisma generate
```

`migrate dev` also generates the client. Run `prisma generate` again any time the schema changes. Do not upgrade Prisma.

## Demo seed

The seed creates or updates one evaluation account and upserts sample readings for the last seven days in Asia/Kolkata, including today. It does not delete other users or readings. Running it again updates the same demo rows.

From `server`:

```bash
npm run db:seed
```

That runs `prisma db seed`, which executes `node prisma/seed.js`.

Prisma 6 prints a deprecation warning because the seed command is configured with the `prisma.seed` field in `server/package.json`. The command still works. This repository keeps that configuration.

### Demo credentials

This account is for evaluation only.

| Field | Value |
| --- | --- |
| Name | Demo Patient |
| Email | demo@sweety.local |
| Password | SweetyDemo123! |

The password is stored in `server/prisma/seed.js` so reviewers can sign in. Do not use this password in production. The database stores only its bcrypt hash.

## Frontend installation and configuration

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

`client/.env.local` is gitignored. The frontend calls paths such as `/auth/login` and `/readings`. The base URL already includes `/api`, so those paths are not prefixed again.

## Run the application

Use two terminals.

Terminal 1, from `server`:

```bash
npm run dev
```

The API listens on [http://localhost:5001](http://localhost:5001). `npm start` runs the same server without nodemon.

Terminal 2, from `client`:

```bash
npm run dev
```

Vite serves the app at [http://localhost:5173](http://localhost:5173).

Open the frontend URL, then register or sign in with the demo account.

## API

Base URL: `http://localhost:5001/api`

Authenticated routes require:

```http
Authorization: Bearer <token>
```

A missing header returns `401` with `"Authentication required"`. A header that is not `Bearer <token>` returns `"Invalid authorization format"`. An invalid or expired token returns `"Invalid or expired token"`.

Successful JSON bodies use `success: true`. Client errors use `success: false` and `message`. Validation errors also include `errors: [{ field, message }]`. Unexpected failures return `500` with `"Internal server error"`.

### Health

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/health` | No | Check that the API is running |

`200`: `{ "success": true, "message": "API is running" }`

### Authentication

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/auth/register` | No | Create an account and return a token |
| POST | `/auth/login` | No | Sign in and return a token |
| GET | `/auth/me` | Yes | Return the current user |

Register body:

```json
{ "name": "Demo Patient", "email": "demo@sweety.local", "password": "SweetyDemo123!" }
```

`201`: `{ "success": true, "message": "Registration successful", "data": { "user": { "id", "name", "email" }, "token" } }`

Login body:

```json
{ "email": "demo@sweety.local", "password": "SweetyDemo123!" }
```

`200`: `{ "success": true, "message": "Login successful", "data": { "user": { "id", "name", "email" }, "token" } }`

`GET /auth/me` returns `200` with `{ "success": true, "data": { "user": { "id", "name", "email" } } }`. An unknown user id returns `404` `"User not found"`.

A duplicate email on register returns `409` `"A user with this email already exists"`. A wrong login returns `401` `"Invalid email or password"`.

### Readings

Every reading belongs to the authenticated user. List, update, and delete look up rows with that user's id. Another user's id returns `404` `"Reading not found"`.

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/readings` | Yes | List the current user's readings |
| POST | `/readings` | Yes | Create a reading |
| PUT | `/readings/:id` | Yes | Replace a reading's date, slot, and value |
| DELETE | `/readings/:id` | Yes | Delete a reading |

Create and update body:

```json
{ "date": "2026-11-24", "slot": "MORNING", "value": 96 }
```

`date` is a `YYYY-MM-DD` calendar date. `slot` is one of `MORNING`, `AFTER_BREAKFAST`, `AFTER_LUNCH`, or `AFTER_DINNER`. `value` is an integer from 40 through 600. A numeric string is accepted and converted to an integer.

Create returns `201` with `"Reading created successfully"` and `data.reading`. Update returns `200` with `"Reading updated successfully"` and `data.reading`. Delete returns `200` with `"Reading deleted successfully"` and the deleted `data.reading`. It is not a `204`.

List returns `200`:

```json
{ "success": true, "data": { "readings": [] } }
```

Readings are ordered by `date` descending, then `createdAt` descending. The stored date is returned as a UTC midnight ISO string, such as `2026-11-24T00:00:00.000Z`. A reading also includes `id`, `userId`, `slot`, `value`, `createdAt`, and `updatedAt`.

A second reading for the same user, date, and slot returns `409` `"A reading already exists for this date and slot."`

### Reports

All report routes require authentication and a `date` query in `YYYY-MM-DD` form.

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/reports/daily?date=YYYY-MM-DD` | Yes | One day's readings and statistics |
| GET | `/reports/mtd?date=YYYY-MM-DD` | Yes | Statistics from the 1st of that month through the selected date |
| GET | `/reports/monthly?date=YYYY-MM-DD` | Yes | Statistics for the previous calendar month relative to the selected date |

Daily `200` data:

```json
{
  "date": "2026-11-24",
  "readings": [],
  "statistics": { "highest": null, "lowest": null, "average": null, "count": 0 }
}
```

Daily readings are sorted Morning, After Breakfast, After Lunch, After Dinner. Slots with no reading are omitted.

Month-to-date and previous-month `200` data:

```json
{
  "dateRange": { "from": "2026-11-01", "to": "2026-11-24" },
  "statistics": { "highest": null, "lowest": null, "average": null, "count": 0 }
}
```

These two reports do not return individual readings. The previous month is calculated on the server from the selected date. The client displays `dateRange` as returned.

## Validation and report calculations

"Today" and the future-date check use the **Asia/Kolkata** calendar date, not the browser's local timezone. A date after that day is rejected with `"Date cannot be in the future"`.

Registration:

- Name is required, trimmed, and 2–50 characters.
- Email is required, trimmed, a valid email, and normalized.
- Password is required, at least 8 characters, contains one letter and one number, and is at most 72 UTF-8 bytes.

Login requires a valid email and a non-empty password.

Readings and report dates:

- Date is required, matches `YYYY-MM-DD`, and must be a real calendar date.
- Slot is required and must be one of the four values above.
- Value is required and must be an integer from 40 through 600.

Validation does not stop at the first failure, so one field can produce more than one message. The response is `400`:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "value", "message": "Value must be an integer between 40 and 600" }]
}
```

Statistics use only the authenticated user's readings in the requested range:

- `count` is the number of readings. An empty range has `count: 0`.
- `highest` and `lowest` are the maximum and minimum values. They are `null` when `count` is 0.
- `average` is the mean rounded to one decimal place. It is `null` when `count` is 0.

An empty range is not an error.

## Testing

There is no automated backend test suite. `server` `npm test` is a placeholder and exits with an error:

```bash
cd server
npm test
```

Frontend checks, from `client`:

```bash
npm run lint
npm run build
```

`npm run lint` runs ESLint. `npm run build` creates the production bundle with Vite. `npm run preview` serves that bundle locally.

### Manual verification

With PostgreSQL, the API, and the frontend running:

- Register a new account. Confirm you land in the app and the header shows your name and initials.
- Sign out, then sign in again with the same email and password.
- Sign in with a wrong password and confirm the login error.
- Try to register the same email again and confirm the duplicate-email error.
- Open Readings and add a value for today in one slot. Confirm it appears in the list and on the Dashboard.
- Add the same date and slot again. Confirm the duplicate-slot message and that a second row is not created.
- Edit the reading, then delete it and confirm it disappears after refresh.
- Open Reports. Check Daily, Month to date, and Last month. Change the date and confirm the statistics follow that date.
- On a day with no readings, confirm the average, highest, and lowest show an empty marker and the count is 0.
- Sign in as the demo user and confirm you cannot see another account's readings.
- Call `GET /api/readings` without a token and confirm `401`.

## Assumptions and possible improvements

- Calendar dates are interpreted in Asia/Kolkata and stored as PostgreSQL `DATE` values.
- A user can store one reading per slot per date.
- The browser keeps the JWT in `localStorage` under `sweety_auth_token`.
- CORS is enabled for the API without an origin allowlist.
- The demo account and its password exist only for evaluation.

Possible later work, not implemented here:

- Automated API and browser tests
- Profile editing and password reset
- Charts for longer trends
- A tighter CORS allowlist and refresh tokens
- Moving the Prisma seed setting if the Prisma 6 deprecation warning should be removed
