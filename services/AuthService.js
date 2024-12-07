const jwt = require("jsonwebtoken");
const knex = require("knex")(require("../knexfile").development);

const JWT_SECRET = process.env.JWT_SECRET;

async function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

async function findUserById(userId) {
  return knex("users").where({ id: userId }).first();
}

module.exports = { verifyToken, findUserById };
