
const express = require('express');
const cors = require('cors');
const gymsService = require('../src/services/gyms.service');
const functions = require('firebase-functions');
const loggingMiddleware = require('../src/middlewares/logging.middleware');
const { getSuccessResponseObject, getErrorResponseObject } = require('../src/utils/responseHelpers');
const { httpStatusCodes } = require('../src/utils/httpStatusCodes');
const { validateFirebaseIdToken } = require('../src/middlewares/auth.middleware');
const userService = require('../src/services/users.service');

const app = express();

app.use(cors({
    origin: ['https://ginagrosso.github.io'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

app.use(loggingMiddleware);

app.post('/auth/register/gym', async (req, res) => {
    try {
        const nuevoGym = await gymsService.registerGym(req.body);
        const response = getSuccessResponseObject(nuevoGym, 'Gimnasio registrado con éxito');
        return res.status(httpStatusCodes.created).json(response);
    } catch (error) {
        const errorResponse = getErrorResponseObject(error);
        const statusCode = errorResponse.statusCode;
        delete errorResponse.statusCode;
        return res.status(statusCode).json(errorResponse);
    }
});

app.get('/gyms', async (req, res) => {
    try {
        const gyms = await gymsService.getAllGyms();
        const response = getSuccessResponseObject(gyms, 'Gimnasios obtenidos con éxito');
        return res.status(httpStatusCodes.ok).json(response);
    } catch (error) {
        const errorResponse = getErrorResponseObject(error);
        const statusCode = errorResponse.statusCode;
        delete errorResponse.statusCode;
        return res.status(statusCode).json(errorResponse);
    }
});

app.get('/gyms/:gymId', validateFirebaseIdToken, async (req, res) => {
    try {
        const { gymId } = req.params;
        const gymProfile = await gymsService.getGymProfile(gymId);
        const response = getSuccessResponseObject(gymProfile, 'Perfil de gimnasio obtenido con éxito');
        return res.status(httpStatusCodes.ok).json(response);
    } catch (error) {
        const errorResponse = getErrorResponseObject(error);
        const statusCode = errorResponse.statusCode;
        delete errorResponse.statusCode;
        return res.status(statusCode).json(errorResponse);
    }
});

app.post('/gyms/:gymId/clients', validateFirebaseIdToken, async (req, res) => {
    try {
        const { gymId } = req.params;
        const loggedUserId = req.user.uid;
        
        // Llamar al service de users
        const newClient = await userService.registerClientManually(gymId, loggedUserId, req.body);
        
        const response = getSuccessResponseObject(newClient, 'Cliente registrado manualmente con éxito');
        return res.status(httpStatusCodes.created).json(response);
    } catch (error) {
        const errorResponse = getErrorResponseObject(error);
        const statusCode = errorResponse.statusCode;
        delete errorResponse.statusCode;
        return res.status(statusCode).json(errorResponse);
    }
});

app.get('/gyms/:gymId/clients', validateFirebaseIdToken, async (req, res) => {
    try {
        const { gymId } = req.params;
        const { status } = req.query;
        const requestingUserId = req.user.uid;

        const clients = await gymsService.getClientsFromGym(gymId, requestingUserId, { status });
        
        const response = getSuccessResponseObject(clients, 'Clientes obtenidos con éxito');
        return res.status(httpStatusCodes.ok).json(response);
    } catch (error) {
        const errorResponse = getErrorResponseObject(error);
        const statusCode = errorResponse.statusCode;
        delete errorResponse.statusCode;
        return res.status(statusCode).json(errorResponse);
    }
});

app.delete('/gyms/:gymId/clients/:clientId', validateFirebaseIdToken, async (req, res) => {
    try {
        const { gymId, clientId } = req.params;
        const loggedUserId = req.user.uid;

        const result = await userService.deactivateClient(gymId, clientId, loggedUserId);
        
        const response = getSuccessResponseObject(result, 'Cliente dado de baja exitosamente');
        return res.status(httpStatusCodes.ok).json(response);
    } catch (error) {
        const errorResponse = getErrorResponseObject(error);
        const statusCode = errorResponse.statusCode;
        delete errorResponse.statusCode;
        return res.status(statusCode).json(errorResponse);
    }
});

// Reactivar un cliente (protegido)
app.patch('/gyms/:gymId/clients/:clientId/activate', validateFirebaseIdToken, async (req, res) => {
    try {
        const { gymId, clientId } = req.params;
        const loggedUserId = req.user.uid;

        const result = await userService.activateClient(gymId, clientId, loggedUserId);
        
        const response = getSuccessResponseObject(result, 'Cliente reactivado exitosamente');
        return res.status(httpStatusCodes.ok).json(response);
    } catch (error) {
        const errorResponse = getErrorResponseObject(error);
        const statusCode = errorResponse.statusCode;
        delete errorResponse.statusCode;
        return res.status(statusCode).json(errorResponse);
    }
});

// Actualizar perfil del gym logeado (protegido)
app.put('/gyms/me', validateFirebaseIdToken, async (req, res) => {
    try {
        const uid = req.user.uid;
        const updatedProfile = await gymsService.updateGymProfile(uid, req.body);
        const response = getSuccessResponseObject(updatedProfile, 'Perfil del gimnasio actualizado exitosamente');
        return res.status(httpStatusCodes.ok).json(response);
    } catch (error) {
        const errorResponse = getErrorResponseObject(error);
        const statusCode = errorResponse.statusCode;
        delete errorResponse.statusCode;
        return res.status(statusCode).json(errorResponse);
    }
});

// Obtener estadísticas del gym (protegido)
app.get('/gyms/:gymId/stats', validateFirebaseIdToken, async (req, res) => {
    try {
        const { gymId } = req.params;
        const loggedUserId = req.user.uid;

        const stats = await gymsService.getGymStats(gymId, loggedUserId);
        
        const response = getSuccessResponseObject(stats, 'Estadísticas obtenidas exitosamente');
        return res.status(httpStatusCodes.ok).json(response);
    } catch (error) {
        const errorResponse = getErrorResponseObject(error);
        const statusCode = errorResponse.statusCode;
        delete errorResponse.statusCode;
        return res.status(statusCode).json(errorResponse);
    }
});

module.exports = functions.https.onRequest(app);