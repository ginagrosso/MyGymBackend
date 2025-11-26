
const express = require('express');
const cors = require('cors');
const gymsService = require('../src/services/gyms.service');
const functions = require('firebase-functions');
const loggingMiddleware = require('../src/middlewares/logging.middleware');
const { getSuccessResponseObject, getErrorResponseObject } = require('../src/utils/responseHelpers');
const { httpStatusCodes } = require('../src/utils/httpStatusCodes');
const { validateFirebaseIdToken } = require('../src/middlewares/auth.middleware');

const app = express();

app.use(cors({
    origin: ['http://localhost:3000', 'https://your-production-domain.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
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
module.exports = functions.https.onRequest(app);