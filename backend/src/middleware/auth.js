const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

function auth(requiredRoles = []) {
  return (req, res, next) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return next(new ApiError(401, 'Token requerido'));
    try {
      const payload = jwt.verify(token, env.JWT_SECRET);
      req.user = payload;
      if (requiredRoles.length && !requiredRoles.includes(payload.role)) {
        return next(new ApiError(403, 'Sin permisos'));
      }
      next();
    } catch (e) {
      next(new ApiError(401, 'Token inválido'));
    }
  };
}

module.exports = auth;