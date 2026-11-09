const ApiError = require('../utils/ApiError');

function validate(rules) {
  return (req, res, next) => {
    const errors = [];
    for (const [field, rule] of Object.entries(rules)) {
      const value = req.body[field];
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} es requerido`);
        continue;
      }
      if (value === undefined) continue;
      if (rule.type === 'number' && Number.isNaN(Number(value))) {
        errors.push(`${field} debe ser numérico`);
      }
      if (rule.enum && !rule.enum.includes(value)) {
        errors.push(`${field} inválido`);
      }
    }
    if (errors.length) return next(new ApiError(400, 'Validación fallida', errors));
    next();
  };
}

module.exports = validate;