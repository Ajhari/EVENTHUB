const bcrypt = require("bcrypt");
const { pool } = require("../db");

function isBcryptHash(value) {
  return typeof value === "string" && /^\$2[aby]\$\d{2}\$/.test(value);
}

async function hashExistingPasswords() {
  const result = await pool.query("SELECT id, email, password_hash FROM users ORDER BY id");
  let updatedCount = 0;
  let alreadyHashedCount = 0;

  for (const user of result.rows) {
    if (isBcryptHash(user.password_hash)) {
      alreadyHashedCount += 1;
      continue;
    }

    const hashedPassword = await bcrypt.hash(user.password_hash, 10);
    await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [
      hashedPassword,
      user.id,
    ]);
    updatedCount += 1;
  }

  console.log(`Users checked: ${result.rows.length}`);
  console.log(`Already hashed: ${alreadyHashedCount}`);
  console.log(`Updated to bcrypt hash: ${updatedCount}`);
}

hashExistingPasswords()
  .catch((error) => {
    console.error("Password hash migration failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
