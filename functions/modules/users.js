const express = require('express');
const cors = require('cors');
const userService = require('../src/services/users.service');
const functions = require('firebase-functions');
const loggingMiddleware = require('../src/middlewares/logging.middleware');
const { validateFirebaseIdToken } = require('../src/middlewares/auth.middleware');
const { getSuccessResponseObject, getErrorResponseObject } = require('../src/utils/responseHelpers');
const { httpStatusCodes } = require('../src/utils/httpStatusCodes');

const app = express();

app.use(cors({
    origin: ['https://ginagrosso.github.io'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

app.use(loggingMiddleware);

app.post('/auth/register/client', async (req, res) => {
    try {
        const nuevoCliente = await userService.registerClient(req.body);
        const response = getSuccessResponseObject(nuevoCliente, 'Cliente registrado con éxito');
        return res.status(httpStatusCodes.created).json(response);
    } catch (error) {
        const errorResponse = getErrorResponseObject(error);
        const statusCode = errorResponse.statusCode;
        delete errorResponse.statusCode;
        return res.status(statusCode).json(errorResponse);
    }
});

// Obtener perfil del usuario actual
app.get('/users/me', validateFirebaseIdToken, async (req, res) => {
    try {
        const uid = req.user.uid;
        const userProfile = await userService.getUserProfile(uid);
        const response = getSuccessResponseObject(userProfile, 'Perfil obtenido exitosamente');
        return res.status(httpStatusCodes.ok).json(response);
    } catch (error) {
        const errorResponse = getErrorResponseObject(error);
        const statusCode = errorResponse.statusCode;
        delete errorResponse.statusCode;
        return res.status(statusCode).json(errorResponse);
    }
});

// Actualizar perfil del usuario actual
app.put('/users/me', validateFirebaseIdToken, async (req, res) => {
    try {
        const uid = req.user.uid;
        const updatedProfile = await userService.updateUserProfile(uid, req.body);
        const response = getSuccessResponseObject(updatedProfile, 'Perfil actualizado exitosamente');
        return res.status(httpStatusCodes.ok).json(response);
    } catch (error) {
        const errorResponse = getErrorResponseObject(error);
        const statusCode = errorResponse.statusCode;
        delete errorResponse.statusCode;
        return res.status(statusCode).json(errorResponse);
    }
});

// Cambiar contraseña del usuario actual
app.put('/users/me/password', validateFirebaseIdToken, async (req, res) => {
    try {
        const uid = req.user.uid;
        const email = req.user.email;
        const result = await userService.changePassword(uid, email, req.body);
        const response = getSuccessResponseObject(result, 'Contraseña actualizada exitosamente');
        return res.status(httpStatusCodes.ok).json(response);
    } catch (error) {
        const errorResponse = getErrorResponseObject(error);
        const statusCode = errorResponse.statusCode;
        delete errorResponse.statusCode;
        return res.status(statusCode).json(errorResponse);
    }
});

module.exports = functions.https.onRequest(app);