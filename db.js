"use strict";
/** Database setup for jobly. */
const { Client } = require("pg");
const { getDatabaseUri } = require("./config");

let DB_URI;

if (process.env.NODE_ENV === "test") {
  DB_URI = "postgresql:///jobly_test";
} else {
  DB_URI = "postgresql:///jobly";
}

let db = new Client({
  connectionString: DB_URI
});

db.connect();

module.exports = db;