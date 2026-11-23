const prisma = require("../config/prisma");
const { hashPassword, comparePassword } = require("../utils/password");
const { generateToken } = require("../utils/jwt");

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function toSafeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

async function registerUser({ name, email, password }) {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw createHttpError(409, "A user with this email already exists");
  }

  const hashedPassword = await hashPassword(password);

  let user;
  try {
    user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
  } catch (error) {
    if (error.code === "P2002") {
      throw createHttpError(409, "A user with this email already exists");
    }
    throw error;
  }

  const token = generateToken(user.id);

  return {
    user: toSafeUser(user),
    token,
  };
}

async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw createHttpError(401, "Invalid email or password");
  }

  const passwordMatches = await comparePassword(password, user.password);

  if (!passwordMatches) {
    throw createHttpError(401, "Invalid email or password");
  }

  const token = generateToken(user.id);

  return {
    user: toSafeUser(user),
    token,
  };
}

async function getCurrentUser(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (!user) {
    throw createHttpError(404, "User not found");
  }

  return user;
}

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
};