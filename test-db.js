const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

pool.query("SELECT 1 + 1 AS result", (err, results) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Database connection successful:", results);
  }
  pool.end();
});
