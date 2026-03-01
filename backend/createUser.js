require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function createUser() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  const hashedPassword = await bcrypt.hash("123456", 10);

  await db.query(
    `INSERT INTO users (username, email, password, role_id, status)
     VALUES (?, ?, ?, ?, ?)`,
    ["admin", "admin@test.com", hashedPassword, 1, "ACTIVE"]
  );

  console.log("Usuario creado correctamente");
  process.exit();
}

createUser();