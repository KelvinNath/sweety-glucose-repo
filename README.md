# Sweety – Blood Glucose Tracker

Repository: [https://github.com/KelvinNath/sweety-glucose-repo](https://github.com/KelvinNath/sweety-glucose-repo)

Sweety lets a person sign in and record blood glucose readings. Each account sees only its own data. Dates use the Asia/Kolkata calendar.

## Demo video

[![Demo video](https://drive.google.com/thumbnail?id=1ABLyyHYLpdX_XvWGjPOdBjc1St83L_PO&sz=w1280)](https://drive.google.com/file/d/1ABLyyHYLpdX_XvWGjPOdBjc1St83L_PO/view?usp=sharing)

**Demo video:** [https://drive.google.com/file/d/1ABLyyHYLpdX_XvWGjPOdBjc1St83L_PO/view?usp=sharing](https://drive.google.com/file/d/1ABLyyHYLpdX_XvWGjPOdBjc1St83L_PO/view?usp=sharing)

## 1. Project overview

A person can save up to four readings a day:

- Morning
- After Breakfast
- After Lunch
- After Dinner

The app then shows a daily summary, a reading history, and three reports: one day, the month so far, and the previous month.

## 2. Features

**Sign in**

- Create an account or sign in with email and password
- Passwords are stored as a bcrypt hash and are never sent back by the API
- Protected pages need a signed-in user
- The app shows the signed-in name. Sign out returns to the login page.

**Readings**

- Add, view, edit, and delete readings
- One reading per time slot per day
- On the dashboard, Add reading opens a form for the selected day

**Checks the app makes**

- Date looks like `2026-11-25` and cannot be a future day in Asia/Kolkata
- The time slot must be one of the four slots above
- The value must be a whole number from 40 to 600
- A second reading for the same day and slot is rejected
- A new account needs a name of 2–50 characters, a valid email, and a password of at least 8 characters with one letter and one number

**Reports**

- Daily: that day’s readings and summary numbers
- Month to date: from the 1st of the selected month through the selected date
- Previous month: the calendar month before the selected date
- Each report shows the highest value, the lowest value, the average to one decimal place, and how many readings were counted
- A period with no readings shows a count of 0 and no highest, lowest, or average

## 3. Technology stack

The app is written in JavaScript. Use Prisma **6.19.3**. Leave that version as it is.

| Part | Tools |
| --- | --- |
| Frontend | React, React Router, Vite, Tailwind CSS |
| Backend | Express, express-validator |
| Database | PostgreSQL, Prisma |
| Sign-in | bcryptjs, JSON Web Tokens |

## 4. Project structure

```text
sweety-glucose-repo/
├── client/          The website (React + Vite)
│   └── src/pages/   Login, Register, Dashboard, Readings, Reports, Profile
├── server/          The API (Express)
│   └── prisma/      Database schema, migration, and sample data
└── README.md
```

## 5. Prerequisites

Install these before you start:

- Node.js and npm
- PostgreSQL, running on your computer

## 6. Environment configuration

Copy the example files. Edit the copies. Do not commit the real files.

**API.** From the `server` folder:

```bash
cp .env.example .env
```

Then set these values in `server/.env`:

| Name | What to put |
| --- | --- |
| `PORT` | `5001` |
| `DATABASE_URL` | Your PostgreSQL login. The database name is `sweety_db`. Replace `USER` and `PASSWORD`. |
| `JWT_SECRET` | A long random secret. Replace the placeholder. |

Example shape:

```text
postgresql://USER:PASSWORD@localhost:5432/sweety_db
```

**Website.** From the `client` folder:

```bash
cp .env.example .env.local
```

`client/.env.example` already has the right local value:

```text
VITE_API_BASE_URL=http://localhost:5001/api
```

Keep the `/api` at the end.

## 7. Database setup

Create the database:

```bash
createdb sweety_db
```

Or in `psql`:

```sql
CREATE DATABASE sweety_db;
```

Then, from the `server` folder:

```bash
npm install
npx prisma migrate dev
npx prisma generate
```

## 8. Seed data

From the `server` folder:

```bash
npm run db:seed
```

This adds one demo account and sample readings for seven days, including today, with all four slots filled. Running it again updates those same rows. It does not delete other accounts.

Prisma 6 prints a warning that the seed setting in `server/package.json` is deprecated. The command still works. Leave that setting unchanged.

Use this account only to try the app. The password below appears in plain text only in `server/prisma/seed.js`. The database stores the hash.

| | |
| --- | --- |
| Name | Demo Patient |
| Email | demo@sweety.local |
| Password | SweetyDemo123! |

## 9. Running the application

Start the API and the website in two terminals.

Terminal 1, from `server`:

```bash
npm run dev
```

API: [http://localhost:5001](http://localhost:5001)

Terminal 2, from `client`:

```bash
npm install
npm run dev
```

Website: [http://localhost:5173](http://localhost:5173)

Open the website, then sign in with the demo account or register a new one.

## 10. Testing

The API has no automated tests. From `server`, `npm test` only prints an error and stops.

From `client`, you can check the website code with:

```bash
npm run lint
npm run build
```

To check the app by hand, with PostgreSQL, the API, and the website running:

1. Register a new account. The app should show that name. Sign out, then sign in again.
2. Try a wrong password. It should be rejected. Try to register the same email again. That should be rejected too.
3. On the dashboard, add a reading for the selected day. It should appear in that day’s slots.
4. On Reading history, edit a reading, then delete one. The deleted reading should leave the dashboard.
5. Save the same day and slot again. The app should reject the duplicate.
6. Open Reports and switch between Daily, Month to date, and Previous month. An empty period shows a count of 0.
7. Sign in as the demo user, then as a second account. The second account should not see the demo readings.

## 11. API overview

Base URL: `http://localhost:5001/api`

Send the token on protected routes as `Authorization: Bearer <token>`. Dates use `YYYY-MM-DD`.

| Method | Path | Sign-in | What it does |
| --- | --- | --- | --- |
| GET | `/health` | No | Check that the API is running |
| POST | `/auth/register` | No | Create an account and return a token |
| POST | `/auth/login` | No | Sign in and return a token |
| GET | `/auth/me` | Yes | Return the current user |
| GET | `/readings` | Yes | List this user's readings |
| POST | `/readings` | Yes | Add a reading |
| PUT | `/readings/:id` | Yes | Replace a reading |
| DELETE | `/readings/:id` | Yes | Delete a reading |
| GET | `/reports/daily?date=` | Yes | One day, with readings and summary numbers |
| GET | `/reports/mtd?date=` | Yes | From the 1st of that month through the date |
| GET | `/reports/monthly?date=` | Yes | The previous calendar month |

## 12. Notes and future improvements

- Dates follow Asia/Kolkata and are stored as calendar dates.
- The browser keeps the sign-in token in `localStorage` under `sweety_auth_token`. A token lasts 7 days.
- The demo account is only for trying the app.

Not built yet:

- Automated API tests
- Editing a profile or resetting a password
- A limited list of allowed websites for API requests
- Refresh tokens
