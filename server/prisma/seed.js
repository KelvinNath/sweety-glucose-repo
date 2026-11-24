require("dotenv").config();

const prisma = require("../src/config/prisma");
const { hashPassword } = require("../src/utils/password");

const DEMO_USER = {
  name: "Demo Patient",
  email: "demo@sweety.local",
  password: "SweetyDemo123!",
};

const SLOTS = ["MORNING", "AFTER_BREAKFAST", "AFTER_LUNCH", "AFTER_DINNER"];

const SAMPLE_DAYS = [
  { daysAgo: 0, values: [96, 148, 132, 126] },
  { daysAgo: 1, values: [102, 156, 141, 134] },
  { daysAgo: 2, values: [91, 139, 128, 119] },
  { daysAgo: 3, values: [108, 172, 154, 143] },
  { daysAgo: 4, values: [87, 131, 124, 116] },
  { daysAgo: 5, values: [99, 161, 147, 138] },
  { daysAgo: 6, values: [94, 144, 135, 122] },
];

function getTodayKolkataDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year").value;
  const month = parts.find((part) => part.type === "month").value;
  const day = parts.find((part) => part.type === "day").value;

  return `${year}-${month}-${day}`;
}

function shiftDate(dateString, days) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);

  const shiftedYear = date.getUTCFullYear();
  const shiftedMonth = String(date.getUTCMonth() + 1).padStart(2, "0");
  const shiftedDay = String(date.getUTCDate()).padStart(2, "0");

  return `${shiftedYear}-${shiftedMonth}-${shiftedDay}`;
}

function toUtcMidnightDate(dateString) {
  return new Date(`${dateString}T00:00:00.000Z`);
}

async function seedDemoUser() {
  const password = await hashPassword(DEMO_USER.password);

  return prisma.user.upsert({
    where: { email: DEMO_USER.email },
    update: {
      name: DEMO_USER.name,
      password,
    },
    create: {
      name: DEMO_USER.name,
      email: DEMO_USER.email,
      password,
    },
  });
}

async function seedReadings(userId) {
  const today = getTodayKolkataDate();
  let count = 0;

  for (const sample of SAMPLE_DAYS) {
    const date = shiftDate(today, -sample.daysAgo);
    const storedDate = toUtcMidnightDate(date);

    for (let index = 0; index < SLOTS.length; index += 1) {
      const slot = SLOTS[index];
      const value = sample.values[index];

      await prisma.reading.upsert({
        where: {
          userId_date_slot: {
            userId,
            date: storedDate,
            slot,
          },
        },
        update: { value },
        create: {
          userId,
          date: storedDate,
          slot,
          value,
        },
      });

      count += 1;
    }
  }

  return count;
}

async function main() {
  try {
    const user = await seedDemoUser();
    const readingCount = await seedReadings(user.id);

    console.log(
      `Seeded ${user.email} with ${readingCount} glucose readings.`,
    );
  } catch (error) {
    console.error("Seed failed.");
    console.error(error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
