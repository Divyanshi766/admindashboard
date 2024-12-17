module.exports = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'superadmin') {
      return res.redirect('../dashboard'); 
  }
  next(); 
};
module.exports = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
      return res.redirect('../dashboard'); 
  }
  next(); 
};
module.exports = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'user') {
      return res.redirect('../dashboard'); 
  }
  next(); 
};

module.exports = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'user') {
      return res.redirect('../dashboard'); 
  }
  next(); 
};
 