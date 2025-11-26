// functions/modules/classes.js
const express = require('express');
const cors = require('cors');
const classService = require('../src/services/classes.service');
const userService = require('../src/services/users.service');
const gymService = require('../src/services/gyms.service');
const loggingMiddleware = require('../src/middlewares/logging.middleware');
const { validateFirebaseIdToken } = require('../src/middlewares/auth.middleware');
const { getSuccessResponseObject, getErrorResponseObject } = require('../src/utils/responseHelpers');
const { httpStatusCodes, AuthorizationError, ResourceNotFoundError } = require('../src/utils/httpStatusCodes');

const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());
app.use(loggingMiddleware);

// =============================================
// HELPERS
// =============================================

/**
 * Helper para verificar que el usuario es un gimnasio
 * @param {object} req - Request object con req.user.uid
 * @returns {string} gymId
 * @throws {AuthorizationError} Si no es un gym
 */
async function getRequestingProfile(req) {
    try {
        const userProfile = await userService.getUserProfile(req.user.uid);
        return userProfile;
    } catch (error) {
        if (error instanceof ResourceNotFoundError) {
            // No es un usuario en /users, intentamos obtenerlo desde /gyms
            return await gymService.getGymProfile(req.user.uid);
        }
        throw error;
    }
}

async function requireGymRole(req) {
    const profile = await getRequestingProfile(req);
    if (profile.userType !== 'gym') {
        throw new AuthorizationError('Solo gimnasios pueden realizar esta acción');
    }
    return profile.uid || req.user.uid; // El uid del gym ES el gymId
}

/**
 * Helper para obtener el gymId según el tipo de usuario
 * @param {object} req - Request object
 * @returns {string} gymId
 */
async function getGymIdFromUser(req) {
    const profile = await getRequestingProfile(req);
    // Si es gym, su uid es el gymId. Si es client, está en su perfil.
    if (profile.userType === 'gym') {
        return profile.uid || req.user.uid;
    }
    if (profile.gymId) {
        return profile.gymId;
    }
    throw new AuthorizationError('El usuario no tiene un gimnasio asociado');
}

/**
 * Helper para manejar errores de forma consistente
 */
function handleError(res, error) {
    const errorResponse = getErrorResponseObject(error);
    const statusCode = errorResponse.statusCode || httpStatusCodes.internalServerError;
    delete errorResponse.statusCode;
    return res.status(statusCode).json(errorResponse);
}

// =============================================
// RUTAS DE CATEGORÍAS (deben ir ANTES de /:id)
// =============================================

/**
 * GET /classes/categories
 * Listar todas las categorías (globales + del gym)
 * Acceso: Gym, Client
 */
app.get('/categories', validateFirebaseIdToken, async (req, res) => {
    try {
        const gymId = await getGymIdFromUser(req);
        const categories = await classService.getCategories(gymId);
        return res.status(httpStatusCodes.ok).json(
            getSuccessResponseObject(categories, 'Categorías obtenidas exitosamente')
        );
    } catch (error) {
        return handleError(res, error);
    }
});

/**
 * POST /classes/categories
 * Crear una categoría personalizada
 * Acceso: Solo Gym
 */
app.post('/categories', validateFirebaseIdToken, async (req, res) => {
    try {
        const gymId = await requireGymRole(req);
        const nuevaCategoria = await classService.createCategory(gymId, req.body);
        return res.status(httpStatusCodes.created).json(
            getSuccessResponseObject(nuevaCategoria, 'Categoría creada exitosamente')
        );
    } catch (error) {
        return handleError(res, error);
    }
});

// =============================================
// RUTAS CRUD DE CLASES
// =============================================

/**
 * GET /classes
 * Listar todas las clases del gimnasio
 * Query params: active=true|false (default: true)
 * Acceso: Gym, Client
 */
app.get('/', validateFirebaseIdToken, async (req, res) => {
    try {
        const gymId = await getGymIdFromUser(req);
        const classes = await classService.getClassesByGym(gymId, req.query);
        return res.status(httpStatusCodes.ok).json(
            getSuccessResponseObject(classes, 'Clases obtenidas exitosamente')
        );
    } catch (error) {
        return handleError(res, error);
    }
});

/**
 * POST /classes
 * Crear una nueva clase
 * Acceso: Solo Gym
 */
app.post('/', validateFirebaseIdToken, async (req, res) => {
    try {
        const gymId = await requireGymRole(req);
        const nuevaClase = await classService.createClass(gymId, req.body);
        return res.status(httpStatusCodes.created).json(
            getSuccessResponseObject(nuevaClase, 'Clase creada exitosamente')
        );
    } catch (error) {
        return handleError(res, error);
    }
});

/**
 * GET /classes/:id
 * Obtener detalle de una clase
 * Acceso: Gym, Client
 */
app.get('/:id', validateFirebaseIdToken, async (req, res) => {
    try {
        const gymId = await getGymIdFromUser(req);
        const clase = await classService.getClassById(gymId, req.params.id);
        return res.status(httpStatusCodes.ok).json(
            getSuccessResponseObject(clase, 'Clase obtenida exitosamente')
        );
    } catch (error) {
        return handleError(res, error);
    }
});

/**
 * PUT /classes/:id
 * Actualizar una clase
 * Acceso: Solo Gym dueño
 */
app.put('/:id', validateFirebaseIdToken, async (req, res) => {
    try {
        const gymId = await requireGymRole(req);
        const claseActualizada = await classService.updateClass(gymId, req.params.id, req.body);
        return res.status(httpStatusCodes.ok).json(
            getSuccessResponseObject(claseActualizada, 'Clase actualizada exitosamente')
        );
    } catch (error) {
        return handleError(res, error);
    }
});

/**
 * DELETE /classes/:id
 * Eliminar (archivar) una clase (soft delete)
 * Acceso: Solo Gym dueño
 */
app.delete('/:id', validateFirebaseIdToken, async (req, res) => {
    try {
        const gymId = await requireGymRole(req);
        const result = await classService.deleteClass(gymId, req.params.id);
        return res.status(httpStatusCodes.ok).json(
            getSuccessResponseObject(result, 'Clase archivada exitosamente')
        );
    } catch (error) {
        return handleError(res, error);
    }
});

/**
 * PATCH /classes/:id/status
 * Cambiar estado activa/inactiva de una clase
 * Body: { activa: boolean }
 * Acceso: Solo Gym dueño
 */
app.patch('/:id/status', validateFirebaseIdToken, async (req, res) => {
    try {
        const gymId = await requireGymRole(req);
        const claseActualizada = await classService.toggleClassStatus(gymId, req.params.id, req.body);
        const estadoTexto = claseActualizada.activa ? 'activada' : 'desactivada';
        return res.status(httpStatusCodes.ok).json(
            getSuccessResponseObject(claseActualizada, `Clase ${estadoTexto} exitosamente`)
        );
    } catch (error) {
        return handleError(res, error);
    }
});

// =============================================
// RUTAS DE HORARIOS (SCHEDULE)
// =============================================

/**
 * GET /classes/:id/schedule
 * Obtener horarios de una clase
 * Acceso: Gym, Client
 */
app.get('/:id/schedule', validateFirebaseIdToken, async (req, res) => {
    try {
        const gymId = await getGymIdFromUser(req);
        const schedule = await classService.getClassSchedule(gymId, req.params.id);
        return res.status(httpStatusCodes.ok).json(
            getSuccessResponseObject(schedule, 'Horarios obtenidos exitosamente')
        );
    } catch (error) {
        return handleError(res, error);
    }
});

/**
 * PUT /classes/:id/schedule
 * Actualizar horarios de una clase
 * Body: { "lunes": ["08:00-10:00"], "martes": ["14:00-16:00"], ... }
 * Acceso: Solo Gym dueño
 */
app.put('/:id/schedule', validateFirebaseIdToken, async (req, res) => {
    try {
        const gymId = await requireGymRole(req);
        const schedule = await classService.updateClassSchedule(gymId, req.params.id, req.body);
        return res.status(httpStatusCodes.ok).json(
            getSuccessResponseObject(schedule, 'Horarios actualizados exitosamente')
        );
    } catch (error) {
        return handleError(res, error);
    }
});

// =============================================
// RUTAS DE IMAGEN
// =============================================

/**
 * PUT /classes/:id/image
 * Actualizar imagen de una clase
 * Body: { imageUrl: "https://..." }
 * Acceso: Solo Gym dueño
 */
app.put('/:id/image', validateFirebaseIdToken, async (req, res) => {
    try {
        const gymId = await requireGymRole(req);
        const claseActualizada = await classService.updateClassImage(gymId, req.params.id, req.body);
        return res.status(httpStatusCodes.ok).json(
            getSuccessResponseObject(claseActualizada, 'Imagen actualizada exitosamente')
        );
    } catch (error) {
        return handleError(res, error);
    }
});

// =============================================
// RUTAS DE ESTADÍSTICAS
// =============================================

/**
 * GET /classes/:id/stats
 * Obtener estadísticas de ocupación de una clase
 * Query params: startDate, endDate
 * Acceso: Solo Gym dueño
 */
app.get('/:id/stats', validateFirebaseIdToken, async (req, res) => {
    try {
        const gymId = await requireGymRole(req);
        const stats = await classService.getClassStats(gymId, req.params.id, req.query);
        return res.status(httpStatusCodes.ok).json(
            getSuccessResponseObject(stats, 'Estadísticas obtenidas exitosamente')
        );
    } catch (error) {
        return handleError(res, error);
    }
});

// =============================================
// RUTAS DE LISTA DE ESPERA (WAITLIST)
// =============================================

/**
 * GET /classes/:id/waitlist
 * Obtener la lista de espera de una clase
 * Acceso: Solo Gym dueño
 */
app.get('/:id/waitlist', validateFirebaseIdToken, async (req, res) => {
    try {
        const gymId = await requireGymRole(req);
        const waitlist = await classService.getWaitlist(gymId, req.params.id);
        return res.status(httpStatusCodes.ok).json(
            getSuccessResponseObject(waitlist, 'Lista de espera obtenida exitosamente')
        );
    } catch (error) {
        return handleError(res, error);
    }
});

/**
 * POST /classes/:id/waitlist
 * Agregar usuario actual a la lista de espera
 * Acceso: Solo Client (se agrega a sí mismo)
 */
app.post('/:id/waitlist', validateFirebaseIdToken, async (req, res) => {
    try {
        const profile = await userService.getUserProfile(req.user.uid);
        
        // Verificar que es un cliente
        if (profile.userType !== 'client') {
            throw new AuthorizationError('Solo clientes pueden inscribirse en la lista de espera');
        }
        
        const gymId = profile.gymId;
        const userId = req.user.uid;
        
        const result = await classService.addToWaitlist(gymId, req.params.id, userId);
        return res.status(httpStatusCodes.created).json(
            getSuccessResponseObject(result, 'Agregado a la lista de espera exitosamente')
        );
    } catch (error) {
        return handleError(res, error);
    }
});

/**
 * DELETE /classes/:id/waitlist/:userId
 * Remover usuario de la lista de espera
 * Acceso: Gym dueño o el mismo Client
 */
app.delete('/:id/waitlist/:userId', validateFirebaseIdToken, async (req, res) => {
    try {
        const profile = await userService.getUserProfile(req.user.uid);
        const targetUserId = req.params.userId;
        
        let gymId;
        
        // Si es gym, puede remover a cualquiera
        if (profile.userType === 'gym') {
            gymId = req.user.uid;
        } 
        // Si es client, solo puede removerse a sí mismo
        else if (profile.userType === 'client') {
            if (req.user.uid !== targetUserId) {
                throw new AuthorizationError('Solo puedes removerte a ti mismo de la lista de espera');
            }
            gymId = profile.gymId;
        } else {
            throw new AuthorizationError('Tipo de usuario no reconocido');
        }
        
        const result = await classService.removeFromWaitlist(gymId, req.params.id, targetUserId);
        return res.status(httpStatusCodes.ok).json(
            getSuccessResponseObject(result, 'Removido de la lista de espera exitosamente')
        );
    } catch (error) {
        return handleError(res, error);
    }
});

module.exports = app;
