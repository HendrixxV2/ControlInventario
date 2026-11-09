const ApiError = require('../utils/ApiError');

function notFound(req, res, next) {
  next(new ApiError(404, 'Ruta no encontrada'));
}

function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({
    error: err.message || 'Error interno',
    details: err.details
  });
}

module.exports = { notFound, errorHandler };