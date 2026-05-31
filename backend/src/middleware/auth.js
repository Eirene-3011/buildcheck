const jwt = require('jsonwebtoken');

function authRequired(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    const e = new Error('Missing or invalid Authorization header');
    e.status = 401;
    return next(e);
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    const e = new Error('Invalid or expired token');
    e.status = 401;
    next(e);
  }
}

function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      const e = new Error('Forbidden: insufficient permissions');
      e.status = 403;
      return next(e);
    }
    next();
  };
}

module.exports = { authRequired, requireRole };
