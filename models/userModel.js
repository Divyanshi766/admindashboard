const pool = require('../configs/db');

const findByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE email = ?';
  const params = [email];

  try {
    console.log('Executing query:', query, 'with params:', params);
    const [rows] = await pool.execute(query, params);
    console.log('Query result:', rows);
    return rows[0];
  } catch (error) {
    console.error('Error in findByEmail:', error);
    throw new Error('Error fetching user by email');
  }
};

const createUser = async (user) => {
  const { username, email, password, role } = user;

  try {
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, password, role]
    );
    return result;
  } catch (error) {
    console.error('Error in createUser:', error);
    throw new Error('Error creating user');
  }
};
const getUsersWithRoles = async () => {
   const query = 'SELECT u.id AS userId,u.Username,u.Email,r.RoleName AS Role FROM users u JOIN roles r ON u.role_id = r.RoleID'; 
  const [rows] = await pool.execute(query);
  return rows;
};
// const getmodulesByUserid = async (roleid) => {
//   const query = `
//     SELECT m.ModuleName 
//     FROM table7_db.usermodules rm 
//     JOIN table7_db.modules m ON m.moduleid = rm.moduleid 
//     WHERE rm.userid = ?`;
//   const params = [roleid]; // Use roleid as input

//   try {
//     console.log('Executing query:', query, 'with params:', params);
//     const [rows] = await pool.execute(query, params);
//     console.log('Query result:', rows);
//     return rows;
//   } catch (error) {
//     console.error('Error in getmodulesByUserid:', error);
//     throw new Error('Error fetching modules by user ID');
//   }
// };


const getmodulesByUserid = async (userId) => {
  //const userId = 1;
  const query = 'select ModuleName from table7_db.usermodules rm join  table7_db.modules m on m.moduleid=rm.moduleid where rm.userid=? ';
  const params = [userId];

  try {
    console.log('Executing query:', query, 'with params:', params);
    const [rows] = await pool.execute(query, params);
    console.log('Query result:', rows);
    return rows;
  } catch (error) {
    console.error('Error in findByroleid:', error);
    throw new Error('Error fetching user by email');
  }
};

module.exports = { findByEmail, createUser,getmodulesByUserid,getUsersWithRoles};
