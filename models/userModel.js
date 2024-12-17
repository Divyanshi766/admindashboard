const db = require('../configs/db');
require('dotenv').config(); 
exports.findByEmail = async (email) => {
  const [rows] = await db.query(
    'SELECT u.id, u.email, r.name as role, u.salt, u.hash ' +
    'FROM users u ' +
    'JOIN roles r ON u.role_id = r.id ' +
    'WHERE u.email = ?',
    [email]
  );
  console.log('User fetched from DB:', rows[0]);
  return rows[0]; 
};
exports.create = async ({ email, hash, salt, role }) => {
  const [result] = await db.query(
    'INSERT INTO users (email, hash, salt, role_id) VALUES (?, ?, ?, ?)',
    [email, hash, salt, role.id] 
  );
  console.log('New user inserted with ID:', result.insertId);
  return { id: result.insertId, email };
};
