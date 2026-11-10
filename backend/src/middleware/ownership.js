const ApiError = require('../utils/ApiError');

/**
 * Middleware de control de acceso por propiedad de recurso.
 *
 * @param {Function} fetchById  Función asíncrona que recibe el id y devuelve el recurso o null.
 * @param {Object}   options    Opciones:
 *   - ownerField: campo del recurso que almacena el id del propietario (default: 'user_id')
 *   - adminRoles: roles que saltan la verificación (default: ['admin'])
 *
 * Ejemplo:
 *   router.put('/:id', auth(), ownership(materialModel.findById), asyncHandler(c.update));
 *
 * Si el recurso no existe -> 404.
 * Si el usuario no es el dueño ni tiene rol admin -> 403.
 */
function ownership(fetchById, options = {}) {
  const { ownerField = 'user_id', adminRoles = ['admin'] } = options;

  return async (req, res, next) => {
    const id = req.params.id;
    if (!id) {
      return next(new ApiError(400, 'Se requiere el id del recurso'));
    }

    try {
      const resource = await fetchById(id);
      if (!resource) {
        return next(new ApiError(404, 'Recurso no encontrado'));
      }

      const user = req.user || {};
      const isAdmin = adminRoles.includes(user.role);

      if (isAdmin) {
        return next();
      }

      const ownerValue = resource[ownerField];
      if (ownerValue == null || Number(ownerValue) !== Number(user.id)) {
        return next(new ApiError(403, 'No tienes permiso sobre este recurso'));
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = ownership;
