/**
 * Middleware de sanitización de entradas.
 *
 * Elimina etiquetas HTML y escapa caracteres peligrosos de los valores string
 * en req.body, req.query y req.params para prevenir XSS al renderizar en el frontend.
 *
 * Campos sensibles (ej. contraseñas) se excluyen mediante `skipFields`.
 *
 * Ejemplo:
 *   router.post('/', auth(), sanitize({ skipFields: ['password'] }), asyncHandler(c.create));
 */
function sanitize(options = {}) {
  const { skipFields = [] } = options;

  const stripHtml = (value) => {
    if (typeof value !== 'string') return value;
    return value
      .replace(/<[^>]*>?/gm, '')          // quita etiquetas HTML
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .trim();
  };

  const sanitizeObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    for (const key of Object.keys(obj)) {
      if (skipFields.includes(key)) continue;
      const val = obj[key];
      if (typeof val === 'string') {
        obj[key] = stripHtml(val);
      } else if (Array.isArray(val)) {
        obj[key] = val.map((v) => (typeof v === 'string' ? stripHtml(v) : v));
      } else if (val && typeof val === 'object') {
        sanitizeObject(val);
      }
    }
    return obj;
  };

  return (req, res, next) => {
    sanitizeObject(req.body);
    sanitizeObject(req.query);
    sanitizeObject(req.params);
    next();
  };
}

module.exports = sanitize;
