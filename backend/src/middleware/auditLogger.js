const ApiError = require('../utils/ApiError');

/**
 * Middleware de auditoría para operaciones de escritura en inventario.
 * Registra usuario, IP, método, ruta, cuerpo y timestamp en consola.
 * No bloquea la respuesta: se ejecuta tras pasar al siguiente middleware.
 *
 * Uso típico: router.post('/', auth(), auditLogger(), asyncHandler(c.create));
 */
function auditLogger() {
  return (req, res, next) => {
    const auditedMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
    if (!auditedMethods.includes(req.method)) {
      return next();
    }

    const user = req.user || {};
    const ip =
      req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      '';

    const auditEntry = {
      timestamp: new Date().toISOString(),
      userId: user.id || null,
      userRole: user.role || null,
      ip: Array.isArray(ip) ? ip[0] : ip,
      method: req.method,
      path: req.originalUrl,
      body: req.body,
      params: req.params,
      query: req.query
    };

    // Log estructurado (fácil de consumir por ELK, CloudWatch, etc.)
    console.log(JSON.stringify({ level: 'audit', ...auditEntry }));

    next();
  };
}

module.exports = auditLogger;
