/**
 * reset-admin-id.js
 *
 * Resets the admin_users table AUTO_INCREMENT counter so the next newly
 * registered admin starts at ID 1 (e.g. after clearing simulated data).
 *
 * Usage:  node reset-admin-id.js
 */

import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const mainDb = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "the_greggory_systems_and_strategy_firm_db_main",
  ...(process.env.DB_SSL === "true"
    ? { ssl: { minVersion: "TLSv1.2", rejectUnauthorized: false } }
    : {}),
});

async function resetAdminUserId() {
  const conn = await mainDb.getConnection();
  try {
    // Reset the AUTO_INCREMENT counter for admin_users
    await conn.query("ALTER TABLE admin_users AUTO_INCREMENT = 1");
    console.log("✅ admin_users AUTO_INCREMENT reset to 1");

    // Optional: check current counter value
    const [rows] = await conn.query(
      "SELECT `AUTO_INCREMENT` FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?",
      [process.env.DB_NAME || "the_greggory_systems_and_strategy_firm_db_main", "admin_users"]
    );
    console.log("📊 Current admin_users AUTO_INCREMENT value:", rows[0]?.AUTO_INCREMENT || "(not set)");
  } finally {
    conn.release();
    await mainDb.end();
  }
}

resetAdminUserId().catch((err) => {
  console.error("❌ Error resetting admin_users ID:", err.message);
  process.exit(1);
});