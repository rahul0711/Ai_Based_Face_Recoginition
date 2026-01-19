import pool from "../config/db.js";

export const logAttendance = async ({ userId, confidence }) => {
  await pool.execute(
    `INSERT INTO attendance (user_id, confidence) VALUES (?, ?)`,
    [userId, confidence]
  );
};

export const getAllAttendance = async () => {
  const [rows] = await pool.execute(
    `
    SELECT 
      a.id,
      u.name AS userName,
      u.email,
      a.confidence,
      a.scanned_at
    FROM attendance a
    INNER JOIN users u ON a.user_id = u.id
    ORDER BY a.scanned_at DESC
    `
  );
  return rows;
};
