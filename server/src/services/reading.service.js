const prisma = require("../config/prisma");

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function toUtcMidnightDate(dateString) {
  return new Date(`${dateString}T00:00:00.000Z`);
}

async function createReading({ userId, date, slot, value }) {
  return prisma.reading.create({
    data: {
      userId,
      date: toUtcMidnightDate(date),
      slot,
      value,
    },
  });
}

async function getReadings({ userId }) {
  return prisma.reading.findMany({
    where: { userId },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
}

async function updateReading({ readingId, userId, date, slot, value }) {
  try {
    return await prisma.reading.update({
      where: {
        id: readingId,
        userId,
      },
      data: {
        date: toUtcMidnightDate(date),
        slot,
        value,
      },
    });
  } catch (error) {
    if (error.code === "P2025") {
      throw createHttpError(404, "Reading not found");
    }
    throw error;
  }
}

async function deleteReading({ readingId, userId }) {
  try {
    return await prisma.reading.delete({
      where: {
        id: readingId,
        userId,
      },
    });
  } catch (error) {
    if (error.code === "P2025") {
      throw createHttpError(404, "Reading not found");
    }
    throw error;
  }
}

module.exports = {
  createReading,
  getReadings,
  updateReading,
  deleteReading,
};