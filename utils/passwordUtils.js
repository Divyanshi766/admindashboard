const crypto = require('crypto');


const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
  return { salt, hash };
};

const verifyPassword = (password, hash, salt) => {
  const hashToVerify = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
  return hash === hashToVerify;
};

module.exports = { hashPassword, verifyPassword };
